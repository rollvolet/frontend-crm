import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class CalculationLineModel extends ValidatedModel {
  validators = {
    offerline: new Validator('presence', {
      presence: true,
    }),
    position: new Validator('number', {
      allowBlank: false,
      positive: true,
    }),
    reductionRate: new Validator('number', {
      allowBlank: true,
    }),
  };

  @attr('number') position;
  @attr amount;
  @attr reductionRate;
  @attr('string', {
    defaultValue() {
      return 'EUR';
    },
  })
  currency;
  @attr description;
  @attr offerline;

  @belongsTo('offerline') offerline;

  get reductionPercentage() {
    return this.reductionRate ? this.reductionRate * 100 : null;
  }

  get arithmeticAmount() {
    if (this.reductionRate) {
      const reduction = this.amount * this.reductionRate;
      return this.amount - reduction;
    } else {
      return this.amount;
    }
  }
}
