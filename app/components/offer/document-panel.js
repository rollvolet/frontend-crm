import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { warn } from '@ember/debug';

export default class OfferDocumentPanelComponent extends Component {
  @service documentGeneration
  @service store

  get sortedOfferlines() {
    return this.args.model.offerlines.sortBy('sequenceNumber');
  }

  @task
  *generateOfferDocument() {
    try {
      yield this.documentGeneration.offerDocument(this.args.model);
    } catch(e) {
      warn(`Something went wrong while generating the offer document`, { id: 'document-generation-failure' });
    }
  }

  @task
  *addOfferline() {
    const offerlines = yield this.args.model.offerlines;
    const number = offerlines.length ? Math.max(...offerlines.map(l => l.sequenceNumber)) : 0;
    const vatRate = yield this.args.model.vatRate;
    const offerline = this.store.createRecord('offerline', {
      sequenceNumber: number + 1,
      offer: this.args.model,
      vatRate: vatRate
    });

    if (this.args.model.isMasteredByAccess) {
      this.args.model.amount = 0; // make sure offer is no longer mastered by Access
      this.args.model.save();
    }

    this.saveOfferline.perform(offerline);
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
    if (!offerline.isNew)
      offerline.rollbackAttributes();
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
