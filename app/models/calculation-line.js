import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class CalculationLineModel extends ValidatedModel {
  validators = {
    offerline: new Validator('presence', {
      presence: true,
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
