import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),

  model: null,
  save: null,
  onContactChange: null,
  onBuildingChange: null,

  actions: {
    setContact(contact) {
      this.set('model.contact', contact);
      this.onContactChange(contact);
    },
    setBuilding(building) {
      this.set('model.building', building);
      this.onBuildingChange(building);
    }
  }
});
