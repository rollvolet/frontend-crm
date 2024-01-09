import { service } from '@ember/service';
import { setOwner } from '@ember/application';

export default class UniqueVatNumberValidator {
  @service store;

  constructor(owner) {
    setOwner(this, owner);
  }

  async validate(value, model /*, attribute*/) {
    if (value && model.changedAttributes().vatNumber) {
      if (value.length > 2) {
        const customers = await this.store.query('customer', {
          page: { size: 1 },
          filter: {
            'vat-number': value,
          },
        });

        if (customers.length && customers.firstObject.id != model.id) {
          return {
            type: 'uniqueVatNumber',
            value,
          };
        }
      }
    }

    return true;
  }
}
