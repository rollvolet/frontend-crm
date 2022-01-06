import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  orderDate: validator('presence', true),
  scheduledHours: validator('number', {
    allowBlank: true,
    positive: true,
  }),
  scheduledNbOfPersons: validator('number', {
    allowBlank: true,
    positive: true,
  }),
});

export default class OrderModel extends Model.extend(Validations) {
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
  @attr('date-midnight') planningDate;
  @attr planningId;
  @attr planningMsObjectId;

  @belongsTo('offer') offer;
  @belongsTo('invoice') invoice;
  @belongsTo('customer') customer;
  @belongsTo('contact') contact;
  @belongsTo('building') building;
  @belongsTo('vat-rate') vatRate;
  @hasMany('deposit') deposits;
  @hasMany('deposit-invoices') depositInvoices;
  // @hasMany('invoiceline') invoicelines;
  @hasMany('interventions') interventions;
  @hasMany('employee', { inverse: null }) technicians;

  get scheduledTotal() {
    return this.scheduledHours * this.scheduledNbOfPersons;
  }

  get execution() {
    if (this.mustBeInstalled) return 'installation';
    else if (this.mustBeDelivered) return 'delivery';
    else return 'pickup';
  }

  get isPlanned() {
    return this.planningMsObjectId != null;
  }

  get isMasteredByAccess() {
    return this.amount != null;
  }

  get isPlanningMasteredByAccess() {
    return this.planningId;
  }

  get url() {
    return `http://data.rollvolet.be/orders/${this.id}`;
  }
}
