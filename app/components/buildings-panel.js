import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { equal } from '@ember/object/computed';

export default Component.extend({
  store: service(),

  customer: null,
  state: 'list', // one of 'list', 'detail', 'create', 'edit'
  displayList: equal('state', 'list'),
  displayDetail: equal('state', 'detail'),
  displayCreate: equal('state', 'create'),
  displayEdit: equal('state', 'edit'),

  createNewBuilding() {
    const defaultLanguage = this.store.peekAll('language').find(l => l.get('code') == 'NED');
    const defaultCountry = this.store.peekAll('country').find(c => c.get('code') == 'BE');
    return this.store.createRecord('building', {
      printInFront: true,
      printPrefix: true,
      printSuffix: true,
      language: defaultLanguage,
      country: defaultCountry,
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
      try { await building.save(); } catch(e) {};
      this.set('selectedBuilding', building);
      this.set('state', 'create');
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
