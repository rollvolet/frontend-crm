import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { sum } from 'ember-awesome-macros';

export default Controller.extend({
  arithmeticAmounts: computed('model', function() {
    return this.get('model').map(i => i.get('arithmeticAmount'));
  }),
  arithmeticVats: computed('model', function() {
    return this.get('model').map(i => i.get('arithmeticVat'));
  }),
  totalAmount: sum('arithmeticAmounts'),
  totalVat: sum('arithmeticVats')
});
