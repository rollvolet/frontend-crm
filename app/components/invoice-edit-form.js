import Component from '@ember/component';

export default Component.extend({
  model: null,
  save: null,
  onBuildingChange: null,
  onContactChange: null,

  actions: {
    setContact(contact) {
      this.set('model.contact', contact);
      this.onContactChange(contact);
    },
    setBuilding(building) {
      this.set('model.building', building);
      this.onBuildingChange(building);
    },
    setVatRate(vatRate) {
      this.set('model.vatRate', vatRate);
      this.set('model.certificateRequired', vatRate.rate == 6);
    }
  }
});
