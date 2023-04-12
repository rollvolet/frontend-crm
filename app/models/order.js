import { attr, belongsTo, hasMany } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class OrderModel extends ValidatedModel {
  validators = {
    orderDate: new Validator('presence', {
      presence: true,
    }),
    scheduledHours: new Validator('number', {
      allowBlank: true,
      positive: true,
    }),
    scheduledNbOfPersons: new Validator('number', {
      allowBlank: true,
      positive: true,
    }),
  };

  @attr('date-midnight') orderDate;
  @attr amount;
  @attr offerNumber;
  @attr requestNumber;
  @attr reference;
  @attr('boolean') depositRequired;
  @attr('boolean') hasProductionTicket;
  @attr('boolean') mustBeInstalled;
  @attr('boolean') mustBeDelivered;
  @attr('boolean') isReady;
  @attr('date-midnight') expectedDate;
  @attr('date-midnight') requiredDate;
  @attr('number') scheduledHours;
  @attr('number') scheduledNbOfPersons;
  @attr comment;
  @attr('boolean') canceled;
  @attr cancellationReason;
  // TODO remove once order is converted to triplestore
  @attr('date-midnight') planningDate;

  @belongsTo('offer') offer;
  @belongsTo('invoice') invoice;
  @belongsTo('customer') customer;
  @belongsTo('contact') contact;
  @belongsTo('building') building;
  @belongsTo('vat-rate') vatRate;
  // TODO enable once order is converted to triplestore
  // @belongsTo('calendar-event') calendarEvent;
  @hasMany('deposit') deposits;
  // @hasMany('invoiceline') invoicelines;
  @hasMany('interventions') interventions;
  @hasMany('employee', { inverse: null }) technicians;

  get scheduledTotal() {
    return this.scheduledHours * this.scheduledNbOfPersons;
  }

  get execution() {
    if (this.mustBeInstalled) {
      return 'installation';
    } else if (this.mustBeDelivered) {
      return 'delivery';
    } else {
      return 'pickup';
    }
  }

  get isMasteredByAccess() {
    return this.amount != null;
  }

  get uri() {
    return `http://data.rollvolet.be/orders/${this.id}`;
  }
}
