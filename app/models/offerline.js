import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  amount: validator('number', {
    allowBlank: true,
    positive: true
  })
});

export default DS.Model.extend(Validations, {
  sequenceNumber: DS.attr(),
  description: DS.attr(),
  amount: DS.attr('number'),

  vatRate: DS.belongsTo('vat-rate'),
  offer: DS.belongsTo('offer')
});
