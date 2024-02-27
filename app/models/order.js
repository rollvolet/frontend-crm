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

  @belongsTo('case', { inverse: 'order', async: true }) case;
  @hasMany('file', { inverse: 'order', async: true }) documents;
  @belongsTo('calendar-event', { inverse: 'order', async: true }) planning;
  @hasMany('invoiceline', { inverse: 'order', async: true }) invoicelines;
  @hasMany('interventions', { inverse: 'origin', async: true }) interventions;
  @hasMany('employee', { inverse: 'orders', async: true }) technicians;

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
