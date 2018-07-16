import Component from '@ember/component';
import { inject as service } from '@ember/service';
import formatDecimalInput from '../utils/format-decimal-input';
import deformatDecimalInput from '../utils/deformat-decimal-input';

export default Component.extend({
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

  initDecimalInput(prop) {
    const formattedValue = formatDecimalInput(this.model.get(prop));
    this.set(`${prop}Input`, formattedValue);
  },

  actions: {
    formatDecimal(prop) {
      const deformattedValue = deformatDecimalInput(this.get(`${prop}Input`));
      this.set(`model.${prop}`, deformattedValue);
      const formattedValue = formatDecimalInput(this.model.get(prop));
      this.set(`${prop}Input`, formattedValue);
    },
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
