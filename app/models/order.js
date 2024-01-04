import { attr, belongsTo, hasMany } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class OrderModel extends ValidatedModel {
  validators = {
    orderDate: new Validator('presence', {
      presence: true,
    }),
    scheduledNbOfHours: new Validator('number', {
      allowBlank: true,
      positive: true,
    }),
    scheduledNbOfPersons: new Validator('number', {
      allowBlank: true,
      positive: true,
    }),
  };

  @attr('string') uri;
  @attr('date') orderDate;
  @attr('date') expectedDate;
  @attr('date') dueDate;
  @attr('boolean') isReady;
  @attr('number') scheduledNbOfHours;
  @attr('number') scheduledNbOfPersons;
  @attr('string', {
    defaultValue() {
      return 'RKB';
    },
  })
  source;

  @belongsTo('case', { inverse: 'order' }) case;
  @hasMany('file', { inverse: 'order' }) documents;
  @belongsTo('calendar-event', { inverse: 'order' }) planning;
  @hasMany('invoiceline', { inverse: 'order' }) invoicelines;
  @hasMany('interventions', { inverse: 'origin' }) interventions;
  @hasMany('employee', { inverse: 'orders' }) technicians;

  get scheduledTotal() {
    return this.scheduledNbOfHours * this.scheduledNbOfPersons;
  }

  get isMasteredByAccess() {
    return this.source == 'Access';
  }

  get isOverdue() {
    return this.dueDate && this.dueDate < new Date();
  }
}
