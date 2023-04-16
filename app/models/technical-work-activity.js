import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class TechnicalWorkActivityModel extends ValidatedModel {
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

  @attr('date') date;

  @belongsTo('invoice', { inverse: 'technicalWorkActivities' }) invoice;
  @belongsTo('employee', { inverse: 'technicalWorkActivities' }) employee;
}
