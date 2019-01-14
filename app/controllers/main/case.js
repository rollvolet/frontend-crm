import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  caseService: service('case'),

  case: null,
  isEnabledEditBuilding: false,
  isEnabledEditContact: false,

  // properties 'contact' and 'building' are set by the afterModel hooks of subroutes

  actions: {
    toggleContactEdit() {
      this.set('isEnabledEditContact', !this.isEnabledEditContact);
    },
    toggleBuildingEdit() {
      this.set('isEnabledEditBuilding', !this.isEnabledEditBuilding);
    },
    async updateContact(contact) {
      this.set('contact', contact);
      this.set('isEnabledEditContact', false);
      await this.caseService.updateContactAndBuilding.perform(contact, this.building);
    },
    async updateBuilding(building) {
      this.set('building', building);
      this.set('isEnabledEditBuilding', false);
      await this.caseService.updateContactAndBuilding.perform(this.contact, building);
    }
  }
});
