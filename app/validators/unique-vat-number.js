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
        const customer = await this.store.queryOne('customer', {
          filter: {
            ':exact:vat-number': value,
          },
        });

        if (customer && customer.id != model.id) {
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
