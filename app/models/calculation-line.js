import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';
import { isPresent } from '@ember/utils';

export default class CalculationLineModel extends ValidatedModel {
  validators = {
    offerline: new Validator('presence', {
      presence: true,
    }),
    amount: new Validator('inline', {
      validate(value, options, model /*, attribute*/) {
        return isPresent(value) || isPresent(model.description);
      },
    }),
    description: new Validator('inline', {
      validate(value, options, model /*, attribute*/) {
        return isPresent(value) || isPresent(model.amount);
      },
    }),
  };

  @attr amount;
  @attr('string', {
    defaultValue() {
      return 'EUR';
    },
  })
  currency;
  @attr description;
  @attr offerline;

  @belongsTo('offerline') offerline;
}
