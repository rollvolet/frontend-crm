import DS from 'ember-data';
import { computed } from '@ember/object';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';

const Validations = buildValidations({
  offerDate: validator('presence', true),
  amount: validator('number', {
    allowBlank: true,
    positive: true
  }),
  foreseenHours: validator('number', {
    allowBlank: true,
    positive: true
  }),
  foreseenNbOfPersons: validator('number', {
    allowBlank: true,
    positive: true
  })
});

export default DS.Model.extend(Validations, {
  number: DS.attr(),
  sequenceNumber: DS.attr(),
  offerDate: DS.attr('date'),
  amount: DS.attr('number'),
  submissionDate: DS.attr('date'),
  foreseenHours: DS.attr('number'),
  foreseenNbOfPersons: DS.attr('number'),
  comment: DS.attr(),
  reference: DS.attr(),

  request: DS.belongsTo('request'),
  order: DS.belongsTo('order'),
  customer: DS.belongsTo('customer'),
  contact: DS.belongsTo('contact'),
  building: DS.belongsTo('building'),
  vatRate: DS.belongsTo('vat-rate'),
  submissionType: DS.belongsTo('submission-type'),

  foreseenTotal: computed('foreseenHours', 'foreseenNbOfPersons', function() {
    return this.get('foreseenHours') * this.get('foreseenNbOfPersons');
  }),

  offerDateStr: dateString('offerDate'),
  submissionDateStr: dateString('submissionDate')
});
