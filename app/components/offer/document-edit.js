import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task, keepLatestTask } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';

export default class OfferDocumentEditComponent extends Component {
  @service store

  @tracked offerlines = []

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    yield this.args.model.sideload('vatRate');
    const offerlines = yield this.args.model.load('offerlines');
    // No need to sideload the VAT rate of each offerlines, since they are included by default by the backend
    this.offerlines = offerlines.toArray();
  }

  get sortedOfferlines() {
    return this.offerlines.sortBy('sequenceNumber');
  }

  get isEnabledAddingOfferlines() {
    return this.vatRate.get('id') != null;
  }

  get vatRate() {
    return this.args.model.vatRate;
  }

  @task
  *addOfferline() {
    const number = this.offerlines.length ? Math.max(...this.offerlines.map(l => l.sequenceNumber)) : 0;
    const offerline = this.store.createRecord('offerline', {
      sequenceNumber: number + 1,
      offer: this.args.model,
      vatRate: this.vatRate
    });

    if (this.args.model.isMasteredByAccess) {
      this.args.model.amount = 0; // make sure offer is no longer mastered by Access
      this.args.model.save();
    }

    const { validations } = yield offerline.validate();
    if (validations.isValid)
      offerline.save();

    this.offerlines.pushObject(offerline);
  }

  @task
  *deleteOfferline(offerline) {
    if (!offerline.isNew)
      offerline.rollbackAttributes();
    this.offerlines.removeObject(offerline);
    yield offerline.destroyRecord();
  }
}
