import Component from '@ember/component';
import { inject as service } from '@ember/service';
import DecimalInputFormatting from '../mixins/decimal-input-formatting';

export default Component.extend(DecimalInputFormatting, {
  store: service(),

  model: null,
  save: null,
  onContactChange: null,
  onBuildingChange: null,

  init() {
    this._super(...arguments);
    this.initDecimalInput('amount');
    this.initDecimalInput('foreseenHours');
    this.initDecimalInput('foreseenNbOfPersons');
  },

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
