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

  get sortedOfferlines() {
    return this.offerlines.sortBy('sequenceNumber');
  }

  get hasMixedVatRates() {
    return this.offerlines.mapBy('vatRate').uniqBy('code').length > 1;
  }

  @keepLatestTask
  *loadData() {
    // TODO use this.args.model.offerlines once the relation is defined
    const offerlines = yield this.store.query('offerline', {
      'filter[offer]': this.args.model.url,
      sort: 'sequence-number',
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
    const number = this.offerlines.length
      ? Math.max(...this.offerlines.map((l) => l.sequenceNumber))
      : 0;
    const vatRate = yield this.args.model.vatRate;
    const offerline = this.store.createRecord('offerline', {
      sequenceNumber: number + 1,
      offer: this.args.model.url,
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
      // no validation in frontend since calculation line needs to be persisted in backend,
      // even without description/amount. Otherwise it will not appear in the list.
      yield calculationLine.save();
    }

    this.offerlines.pushObject(offerline);
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
