import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import BaseValidator from 'ember-cp-validations/validators/base';

@classic
class UniqueVatNumber extends BaseValidator {
  @service
  store;

  async validate(value, options, model /*, attribute*/) {
    if (value && model.changedAttributes().vatNumber) {
      if (value.length > 2) {
        const customers = await this.store.query('customer', {
          page: { size: 1 },
          filter: {
            'vat-number': value,
          },
        });

        if (customers.length && customers.firstObject.id != model.id)
          return this.createErrorMessage('uniqueVatNumber', value);
      }
    }

    return true;
  }
}

UniqueVatNumber.reopenClass({
  /**
   * Define attribute specific dependent keys for your validator
   *
   * [
   * 	`model.array.@each.${attribute}` --> Dependent is created on the model's context
   * 	`${attribute}.isValid` --> Dependent is created on the `model.validations.attrs` context
   * ]
   *
   * @param {String}  attribute   The attribute being evaluated
   * @param {Unknown} options     Options passed into your validator
   * @return {Array}
   */
  getDependentsFor(attribute /*, options */) {
    return [attribute];
  },
});

export default UniqueVatNumber;
