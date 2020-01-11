import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';

@classic
export default class CaseController extends Controller {
  @service('case')
  caseService;

  isEnabledEditBuilding = false;
  isEnabledEditContact = false;

  @alias('caseService.updateContact.isRunning')
  isUpdatingContact;

  @alias('caseService.updateBuilding.isRunning')
  isUpdatingBuilding;

  @action
  toggleContactEdit() {
    this.set('isEnabledEditContact', !this.isEnabledEditContact);
  }

  @action
  toggleBuildingEdit() {
    this.set('isEnabledEditBuilding', !this.isEnabledEditBuilding);
  }

  @action
  async updateContact(contact) {
    this.set('contact', contact);
    this.set('isEnabledEditContact', false);
    await this.caseService.updateContact.perform(contact, this.building);
  }

  @action
  async updateBuilding(building) {
    this.set('building', building);
    this.set('isEnabledEditBuilding', false);
    await this.caseService.updateBuilding.perform(this.contact, building);
  }
}
