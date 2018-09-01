import Component from '@ember/component';
import { neq } from 'ember-awesome-macros';
import raw from 'ember-macro-helpers/raw';

export default Component.extend({
  model: null,

  isNbOfPersonsWarning: neq('model.foreseenNbOfPersons', raw(2)),

  actions: {
    async reloadVisit() {
      const request = await this.model.request;
      request.belongsTo('visit').reload();
    }
  }
});
