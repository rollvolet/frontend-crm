import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

export default Component.extend({
  store: service(),
  router: service(),

  classNames: ['clickable'],

  customer: null,
  duplicate: null,

  vatNumber: reads('customer.vatNumber'),

  async init() {
    this._super(...arguments);

    const duplicate = this.store.peekAll('customer').find(c => c.id != this.customer.id && c.vatNumber == this.vatNumber);

    if (duplicate) {
      this.set('duplicate', duplicate);
    } else {
      const duplicates = await this.store.query('customer', {
        page: { size: 1 },
        filter: {
          'vat-number': this.vatNumber
        }
      });

      if (duplicates.length)
        this.set('duplicate', duplicates.firstObject);
    }
  },

  click() {
    if (this.duplicate)
      this.router.transitionTo('main.customers.edit', this.duplicate.id);
  }
});
