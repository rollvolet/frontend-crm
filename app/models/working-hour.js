import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class WorkingHourModel extends ValidatedModel {
  validators = {
    date: new Validator('presence', {
      presence: true,
    }),
    invoice: new Validator('presence', {
      presence: true,
    }),
    employee: new Validator('presence', {
      presence: true,
    }),
  };

  @attr('date-midnight') date;
  @belongsTo('invoice') invoice;
  @belongsTo('employee') employee;
}
