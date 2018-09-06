import Component from '@ember/component';
import { neq, sum } from 'ember-awesome-macros';
import raw from 'ember-macro-helpers/raw';
import { mapBy } from 'ember-awesome-macros/array';

export default Component.extend({
  model: null,

  isNbOfPersonsWarning: neq('model.foreseenNbOfPersons', raw(2)),
  totalAmount: sum(mapBy('model.offerlines.@each.amount', raw('amount'))),

  actions: {
    async reloadVisit() {
      const request = await this.model.request;
      request.belongsTo('visit').reload();
    }
  }
});
