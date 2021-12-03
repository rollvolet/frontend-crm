import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import sum from '../../utils/math/sum';
import { task } from 'ember-concurrency';

export default class DepositPanelsComponent extends Component {
  @service case;
  @service store;

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

  get totalAmount() {
    return sum(this.args.model.mapBy('arithmeticAmount'));
  }

  @task
  *createNewDeposit() {
    const deposit = this.store.createRecord('deposit', {
      customer: this.customer,
      order: this.order,
      paymentDate: new Date(),
      amount: 0,
    });
    const { validations } = yield deposit.validate();
    if (validations.isValid) yield deposit.save();

    this.args.didCreateDeposit();
  }

  @task
  *deleteDeposit(deposit) {
    yield deposit.destroyRecord();
  }
}
