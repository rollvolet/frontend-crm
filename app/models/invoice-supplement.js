import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  nbOfPieces: validator('number', {
    positive: true
  })
});

export default DS.Model.extend(Validations, {
  sequenceNumber: DS.attr(),
  nbOfPieces: DS.attr('number'),
  amount: DS.attr('number'),
  description: DS.attr(),
  invoice: DS.belongsTo('invoice'),
  unit: DS.belongsTo('product-unit')
});
