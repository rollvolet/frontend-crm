import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { sum } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';

export default Controller.extend({
  store: service(),

  arithmeticAmounts: computed('model', function() {
    return this.get('model') ? this.get('model').map(i => i.get('arithmeticAmount')) : 0;
  }),
  arithmeticVats: computed('model', function() {
    return this.get('model') ? this.get('model').map(i => i.get('arithmeticVat')) : 0;
  }),
  totalAmount: sum('arithmeticAmounts'),
  totalVat: sum('arithmeticVats'),

  actions: {
    async createNewDeposit() {
      const deposit = this.store.createRecord('deposit', {
        customer: this.customer,
        order: this.order,
        paymentDate: new Date(),
        amount: 0
      });
      this.order.deposits.pushObject(deposit);
      return deposit.save();
    }
  }
});
