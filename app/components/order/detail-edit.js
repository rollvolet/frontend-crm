import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';

export default class OrderDetailEditComponent extends Component {
  @service store

  @tracked visitor
  @tracked offer
  @tracked request

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @(task(function * () {
    this.offer = yield this.args.model.load('offer');
    this.request = yield this.offer.request; // TODO replace with datastorefront load()
    if (this.request.visitor) {
      this.visitor = this.store.peekAll('employee').find(e => e.firstName == this.request.visitor);
    }
  }).keepLatest())
  loadData

  @action
  setCanceled(value) {
    this.args.model.canceled = value;

    if (!value)
      this.args.model.cancellationReason = null;
  }

  @action
  setExecution(execution) {
    this.args.model.mustBeInstalled = false;
    this.args.model.mustBeDelivered = false;

    if (execution == 'installation')
      this.args.model.mustBeInstalled = true;
    else if (execution == 'delivery')
      this.args.model.mustBeDelivered = true;
  }

  @action
  async setVisitor(visitor) {
    this.visitor = visitor;
    const firstName = visitor ? visitor.firstName : null;
    this.request.set('visitor', firstName); // TODO replace with native ES6 assignment
  }

}
