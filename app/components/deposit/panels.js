import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { keepLatestTask, task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class DepositPanelsComponent extends Component {
  @service case;
  @service store;

  @tracked deposits = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    const deposits = yield this.args.model.deposits;
    this.deposits = deposits.toArray();
  }

  get customer() {
    return this.case.current && this.case.current.customer;
  }

  get order() {
    return this.case.current && this.case.current.order;
  }

  get invoice() {
    return this.case.current && this.case.current.invoice;
  }

  get isDisabledEdit() {
    return this.order.isMasteredByAccess || this.invoice;
  }

  @task
  *createNewDeposit() {
    const deposit = this.store.createRecord('deposit', {
      customer: this.customer,
      order: this.order,
      paymentDate: new Date()
    });
    const { validations } = yield deposit.validate();
    if (validations.isValid)
      yield deposit.save();

    this.deposits.pushObject(deposit);
  }

  @task
  *removeDeposit(deposit) {
    this.deposits.removeObject(deposit);
    yield deposit.destroyRecord();
  }
}
