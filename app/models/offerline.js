import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  amount: [
    validator('presence', true),
    validator('number', {
      positive: true
    })
  ],
  vatRate: validator('presence', true),
  description: validator('presence', true)
});

export default DS.Model.extend(Validations, {
  sequenceNumber: DS.attr(),
  description: DS.attr(),
  amount: DS.attr('number'),
  isOrdered: DS.attr('boolean'),

  vatRate: DS.belongsTo('vat-rate'),
  offer: DS.belongsTo('offer')
});
