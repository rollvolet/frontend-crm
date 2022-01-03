import Model, { attr, belongsTo } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';
import { isPresent } from '@ember/utils';

const Validations = buildValidations({
  offerline: validator('presence', true),
  amount: validator('inline', {
    dependentKeys: ['model.description'],
    validate(value, options, model /*, attribute*/) {
      return isPresent(value) || isPresent(model.description);
    },
  }),
  description: validator('inline', {
    dependentKeys: ['model.amount'],
    validate(value, options, model /*, attribute*/) {
      return isPresent(value) || isPresent(model.amount);
    },
  }),
});

export default class CalculationLineModel extends Model.extend(Validations) {
  @attr amount;
  @attr('string', {
    defaultValue() {
      return 'EUR';
    },
  }) currency;
  @attr description;
  @attr offerline;

  @belongsTo('offerline') offerline;
}
