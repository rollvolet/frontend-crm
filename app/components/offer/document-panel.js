import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task, all, keepLatestTask } from 'ember-concurrency';

export default class OfferDocumentPanelComponent extends Component {
  @service documentGeneration;
  @service store;

  @tracked versionEditMode = false;
  @tracked offerlines = [];

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
    return this.offerlines.sortBy('position');
  }

  get hasMixedVatRates() {
    return this.offerlines.mapBy('vatRate').uniqBy('code').length > 1;
  }

  @keepLatestTask
  *loadData() {
    // TODO use this.args.model.offerlines once the relation is defined
    const offerlines = yield this.store.query('offerline', {
      'filter[:exact:offer]': this.args.model.uri,
      sort: 'position',
      page: { size: 100 },
    });
    this.offerlines = offerlines.toArray();
  }

  @task
  *generateOfferDocument() {
    try {
      yield this.documentGeneration.offerDocument(this.args.model);
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
    const vatRate = yield this.args.model.vatRate;
    const offerline = this.store.createRecord('offerline', {
      position: position + 1,
      offer: this.args.model.uri,
      amount: 0,
      vatRate: vatRate,
    });
    offerline.initialEditMode = true;

    if (this.args.model.isMasteredByAccess) {
      this.args.model.amount = 0; // make sure offer is no longer mastered by Access
      this.args.model.save();
    }

    yield this.saveOfferline.perform(offerline);

    if (!offerline.isNew) {
      const calculationLine = this.store.createRecord('calculation-line', {
        offerline: offerline,
        position: 1,
      });
      // no validation in FE since calculation line needs to be persisted in BE,
      // even without description/amount. Otherwise it will not appear in the list.
      yield calculationLine.save();
    }

    this.offerlines.pushObject(offerline);
  }

  @task
  *copyOfferline(offerline) {
    const position = this.offerlines.length
      ? Math.max(...this.offerlines.map((l) => l.position))
      : 0;
    const vatRate = yield offerline.vatRate;
    const calculationLines = yield offerline.calculationLines;

    const copiedOfferline = this.store.createRecord('offerline', {
      position: position + 1,
      offer: this.args.model.uri,
      description: offerline.description,
      amount: offerline.amount,
      vatRate: vatRate,
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

    this.offerlines.pushObject(copiedOfferline);
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
    this.offerlines.removeObject(offerline);
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
    this.documentGeneration.downloadOfferDocument(this.args.model);
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
