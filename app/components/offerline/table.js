import Component from '@glimmer/component';
import { keepLatestTask } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class OfferlineTableComponent extends Component {
  @tracked offerlines = []

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.offerlines = yield this.args.model;
  }

  get sortedOfferlines() {
    return this.offerlines.sortBy('sequenceNumber');
  }
}
