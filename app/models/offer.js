import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';

const Validations = buildValidations({
  offerlines: validator('has-many'),

  offerDate: validator('presence', true),
  amount: validator('number', {
    allowBlank: true,
    positive: true
  })
});

export default DS.Model.extend(Validations, {
  number: DS.attr(),
  sequenceNumber: DS.attr(),
  requestNumber: DS.attr(),
  offerDate: DS.attr('date'),
  comment: DS.attr(),
  reference: DS.attr(),
  documentIntro: DS.attr(),
  documentOutro: DS.attr(),

  request: DS.belongsTo('request'),
  order: DS.belongsTo('order'),
  customer: DS.belongsTo('customer'),
  contact: DS.belongsTo('contact'),
  building: DS.belongsTo('building'),
  vatRate: DS.belongsTo('vat-rate'),
  submissionType: DS.belongsTo('submission-type'),
  offerlines: DS.hasMany('offerline'),

  offerDateStr: dateString('offerDate')
});
