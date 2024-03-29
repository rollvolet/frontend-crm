import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked, cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { warn } from '@ember/debug';
import { task, all, keepLatestTask } from 'ember-concurrency';
import { TrackedArray } from 'tracked-built-ins';
import { compare } from '@ember/utils';
import uniqBy from 'lodash/uniqBy';
import { TrackedAsyncData } from 'ember-async-data';
import generateDocument from '../../utils/generate-document';
import previewDocument from '../../utils/preview-document';
import constants from '../../config/constants';

const { FILE_TYPES } = constants;

export default class OfferDocumentPanelComponent extends Component {
  @service store;

  @tracked versionEditMode = false;
  @tracked offerlines = new TrackedArray([]);

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  willDestroy() {
    super.willDestroy(...arguments);
    // Reset dangling edit modes
    this.offerlines.forEach((offerline) => delete offerline.initialEditMode);
  }

  get sortedOfferlines() {
    return this.offerlines.slice(0).sort((a, b) => compare(a.position, b.position));
  }

  @cached
  get hasMixedVatRates() {
    const promise = (async () => {
      const vatRates = await Promise.all(this.offerlines.map((offerline) => offerline.vatRate));
      return uniqBy(vatRates, 'uri').length > 1;
    })();
    return new TrackedAsyncData(promise);
  }

  @keepLatestTask
  *loadData() {
    const offerlines = yield this.store.query('offerline', {
      'filter[offer][:uri:]': this.args.model.uri,
      include: 'vat-rate',
      sort: 'position',
      page: { size: 100 },
    });
    this.offerlines = new TrackedArray(offerlines);

    // Data required for VAT rate list on offerlines
    const _case = yield this.args.model.case;
    yield _case.customer;
  }

  @task
  *generateOfferDocument() {
    try {
      yield generateDocument(`/offers/${this.args.model.id}/documents`, {
        record: this.args.model,
      });
    } catch (e) {
      warn(`Something went wrong while generating the offer document`, {
        id: 'document-generation-failure',
      });
    }
  }

  @task
  *addOfferline() {
    const position = this.offerlines.length
      ? Math.max(...this.offerlines.map((l) => l.position))
      : 0;
    const _case = yield this.args.model.case;
    const vatRate = yield _case.vatRate;
    const offerline = this.store.createRecord('offerline', {
      position: position + 1,
      amount: 0,
      offer: this.args.model,
      vatRate,
    });
    offerline.initialEditMode = true;

    yield this.saveOfferline.perform(offerline);

    if (!offerline.isNew) {
      const calculationLine = this.store.createRecord('calculation-line', {
        position: 1,
        offerline,
      });
      // no validation in FE since calculation line needs to be persisted in BE,
      // even without description/amount. Otherwise it will not appear in the list.
      yield calculationLine.save();
    }

    this.offerlines.push(offerline);
  }

  @task
  *copyOfferline(offerline) {
    const position = this.offerlines.length
      ? Math.max(...this.offerlines.map((l) => l.position))
      : 0;
    const _case = yield this.args.model.case;
    const vatRate = yield _case.vatRate;
    const calculationLines = yield offerline.calculationLines;

    const copiedOfferline = this.store.createRecord('offerline', {
      position: position + 1,
      description: offerline.description,
      amount: offerline.amount,
      offer: this.args.model,
      vatRate,
    });
    copiedOfferline.initialEditMode = true;

    yield this.saveOfferline.perform(copiedOfferline);

    yield all(
      calculationLines.map(async (calculationLine) => {
        const copiedCalculationLine = this.store.createRecord('calculation-line', {
          offerline: copiedOfferline,
          position: calculationLine.position,
          amount: calculationLine.amount,
          reductionRate: calculationLine.reductionRate,
          description: calculationLine.description,
        });
        // no validation in FE since calculation line needs to be persisted in BE,
        // even without description/amount. Otherwise it will not appear in the list.
        await copiedCalculationLine.save();
      })
    );

    this.offerlines.push(copiedOfferline);
  }

  @task
  *moveOfferlineUp(offerline) {
    const index = this.sortedOfferlines.indexOf(offerline);

    if (index > 0) {
      const position = offerline.position;
      const previousOfferline = this.sortedOfferlines[index - 1];
      const previousPosition = previousOfferline.position;
      offerline.position = previousPosition;
      previousOfferline.position = position;

      yield all([offerline.save(), previousOfferline.save()]);
    }
    // else: offerline is already at the top of the list
  }

  @task
  *moveOfferlineDown(offerline) {
    const index = this.sortedOfferlines.indexOf(offerline);

    if (index < this.offerlines.length - 1) {
      const position = offerline.position;
      const nextOfferline = this.sortedOfferlines[index + 1];
      const nextPosition = nextOfferline.position;
      offerline.position = nextPosition;
      nextOfferline.position = position;

      yield all([offerline.save(), nextOfferline.save()]);
    }
    // else: offerline is already at the end of the list
  }

  @task
  *saveOfferline(offerline) {
    const { validations } = yield offerline.validate();
    if (validations.isValid) {
      yield offerline.save();
    }
  }

  @task
  *deleteOfferline(offerline) {
    const i = this.offerlines.indexOf(offerline);
    if (i >= 0) {
      this.offerlines.splice(i, 1);
    }
    if (!offerline.isNew) {
      offerline.rollbackAttributes();
    }
    const calculationLines = yield offerline.calculationLines;
    yield all(calculationLines.map((line) => line.destroyRecord()));
    yield offerline.destroyRecord();
  }

  @task
  *saveDocumentline() {
    if (this.args.model.hasDirtyAttributes) {
      const { validations } = yield this.args.model.validate();
      if (validations.isValid) {
        yield this.args.model.save();
      }
    }
  }

  @task
  *saveDocumentVersion() {
    if (this.args.model.hasDirtyAttributes) {
      const { validations } = yield this.args.model.validate();
      if (validations.isValid) {
        yield this.args.model.save();
      }
    }
  }

  @action
  downloadOfferDocument() {
    previewDocument(FILE_TYPES.OFFER, this.args.model.uri);
  }

  @action
  openVersionEdit() {
    this.versionEditMode = true;
  }

  @action
  closeVersionEdit() {
    this.versionEditMode = false;
  }
}
