import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

const Validations = buildValidations({
  amount: validator('presence', true),
  vatRate: validator('presence', true),
  description: validator('presence', true)
});

export default DS.Model.extend(Validations, {
  sequenceNumber: DS.attr(),
  description: DS.attr(),
  amount: DS.attr('number'),
  isOrdered: DS.attr('boolean'),

  vatRate: DS.belongsTo('vat-rate'),
  offer: DS.belongsTo('offer'),

  arithmeticAmount: alias('amount'),
  arithmeticVat: computed('amount', 'vatRate', async function() {
    const vatRate = await this.vatRate;
    const rate = vatRate.rate / 100;
    const vat = this.amount * rate;
    return vat;
  }),
});
