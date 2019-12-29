import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';

@classic
@classNames('clickable')
export default class DuplicateVatNumberWarning extends Component {
  @service
  store;

  @service
  router;

  customer = null;
  duplicate = null;

  @reads('customer.vatNumber')
  vatNumber;

  async init() {
    super.init(...arguments);

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
  }

  click() {
    if (this.duplicate)
      this.router.transitionTo('main.customers.edit', this.duplicate.id);
  }
}
