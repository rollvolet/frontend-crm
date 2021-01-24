import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CaseCustomerPanelComponent extends Component {
  @service('case') caseService

  @tracked isEnabledEditBuilding = false
  @tracked isEnabledEditContact = false

  get isUpdatingContact() {
    return this.caseService.updateContact.isRunning;
  }

  get isUpdatingBuilding() {
    return this.caseService.updateBuilding.isRunning;
  }

  get contact() {
    return this.caseService.current && this.caseService.current.contact;
  }

  get building() {
    return this.caseService.current && this.caseService.current.building;
  }

  @action
  toggleContactEdit() {
    this.isEnabledEditContact = !this.isEnabledEditContact;
  }

  @action
  toggleBuildingEdit() {
    this.isEnabledEditBuilding = !this.isEnabledEditBuilding;
  }

  @action
  async updateContact(contact) {
    this.isEnabledEditContact = false;
    await this.caseService.updateContact.perform(contact);
  }

  @action
  async updateBuilding(building) {
    this.isEnabledEditBuilding = false;
    await this.caseService.updateBuilding.perform(building);
  }
}
