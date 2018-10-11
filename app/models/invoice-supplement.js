import { computed } from '@ember/object';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  nbOfPieces: validator('number', {
    positive: true
  }),
  amount: validator('number', {
    positive: true
  })
});

export default DS.Model.extend(Validations, {
  sequenceNumber: DS.attr(),
  nbOfPieces: DS.attr('number'),
  amount: DS.attr('number'),
  description: DS.attr(),
  invoice: DS.belongsTo('invoice'),

  totalAmount: computed('amount', 'nbOfPieces', function() {
    const nbOfPieces = this.nbOfPieces || 1;
    return nbOfPieces * this.amount;
  })
});
