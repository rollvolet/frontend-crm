import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  caseService: service('case'),

  case: null,
  isEnabledEditBuilding: false,
  isEnabledEditContact: false,

  isUpdatingContact: alias('caseService.updateContact.isRunning'),
  isUpdatingBuilding: alias('caseService.updateBuilding.isRunning'),

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
      await this.caseService.updateContact.perform(contact, this.building);
    },
    async updateBuilding(building) {
      this.set('building', building);
      this.set('isEnabledEditBuilding', false);
      await this.caseService.updateBuilding.perform(this.contact, building);
    }
  }
});
