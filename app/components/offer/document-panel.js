import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task, all } from 'ember-concurrency';

export default class OfferDocumentPanelComponent extends Component {
  @service documentGeneration;
  @service store;

  get sortedOfferlines() {
    return this.args.model.offerlines.sortBy('sequenceNumber');
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
    const offerlines = yield this.args.model.offerlines;
    const number = offerlines.length ? Math.max(...offerlines.map((l) => l.sequenceNumber)) : 0;
    const vatRate = yield this.args.model.vatRate;
    const offerline = this.store.createRecord('offerline', {
      sequenceNumber: number + 1,
      offer: this.args.model,
      amount: 0,
      vatRate: vatRate,
    });
    // Workaround to postpone rendering of offerline until calculation line is created
    offerline.set('underConstruction', true);

    if (this.args.model.isMasteredByAccess) {
      this.args.model.amount = 0; // make sure offer is no longer mastered by Access
      this.args.model.save();
    }

    yield this.saveOfferline.perform(offerline);

    if (!offerline.isNew) {
      const calculationLine = this.store.createRecord('calculation-line', {
        offerline: offerline.url,
      });
      // no validation in frontend since calculation line needs to be persisted in backend,
      // even without description/amount. Otherwise it will not appear in the list.
      yield calculationLine.save();
      offerline.set('underConstruction', false);
    }
  }

  @task
  *saveOfferline(offerline) {
    const { validations } = yield offerline.validate();
    if (validations.isValid) {
      yield offerline.save();
    }
  }

  @task
  *deleteOfferline(offerline, calculationLines) {
    if (!offerline.isNew) {
      offerline.rollbackAttributes();
    }
    // TODO get calculationLines as relation from offerline instead of argument
    // once relation has been defined
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

  @action
  downloadOfferDocument() {
    this.documentGeneration.downloadOfferDocument(this.args.model);
  }
}
