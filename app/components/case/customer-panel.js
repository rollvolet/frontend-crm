import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class CaseCustomerPanelComponent extends Component {
  @service case;
  @service router;

  @tracked isEnabledEditBuilding = false;
  @tracked isEnabledEditContact = false;

  get isUpdatingContact() {
    return this.case.updateContact.isRunning;
  }

  get isUpdatingBuilding() {
    return this.case.updateBuilding.isRunning;
  }

  get isEnabledUnlinkCustomer() {
    const current = this.case.current;
    const isRequestWithoutOffer = current.request != null && current.offer == null;
    const isInterventionWithoutInvoice = current.intervention != null && current.invoice == null;
    return isRequestWithoutOffer || isInterventionWithoutInvoice;
  }

  get contact() {
    return this.case.current && this.case.current.contact;
  }

  get building() {
    return this.case.current && this.case.current.building;
  }

  @task
  *unlinkCustomer() {
    yield this.case.unlinkCustomer.perform();

    if (this.case.current.request)
      this.router.transitionTo('main.requests.edit', this.case.current.request.id);
    else if (this.case.current.intervention)
      this.router.transitionTo('main.interventions.edit', this.case.current.intervention.id);
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
    await this.case.updateContact.perform(contact);
  }

  @action
  async updateBuilding(building) {
    this.isEnabledEditBuilding = false;
    await this.case.updateBuilding.perform(building);
  }
}
