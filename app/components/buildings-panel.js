import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { equal } from '@ember/object/computed';

export default Component.extend({
  store: service(),
  configuration: service(),

  customer: null,
  state: 'list', // one of 'list', 'detail', 'edit'
  displayList: equal('state', 'list'),
  displayDetail: equal('state', 'detail'),
  displayEdit: equal('state', 'edit'),

  createNewBuilding() {
    return this.store.createRecord('building', {
      printInFront: true,
      printPrefix: true,
      printSuffix: true,
      language: this.configuration.defaultLanguage(),
      country: this.configuration.defaultCountry(),
      customer: this.customer
    });
  },

  actions: {
    openDetail(building) {
      this.set('selectedBuilding', building);
      this.set('state', 'detail');
    },
    closeDetail() {
      this.set('state', 'list');
      this.set('selectedBuilding', null);
    },
    async openCreate() {
      const building = this.createNewBuilding();
      this.set('state', 'edit');
      this.set('selectedBuilding', building);
      try { await building.save(); } catch(e) {} // eslint-disable-line no-empty
    },
    openEdit(building) {
      this.set('selectedBuilding', building);
      this.set('state', 'edit');
    },
    closeEdit() {
      this.set('state', 'list');
      this.set('selectedBuilding', null);
    }
  }
});
