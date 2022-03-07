import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task, keepLatestTask } from 'ember-concurrency';

/**
 * Arguments
 * @model {Customer} customer record to show. Optional, might be null.
 */
export default class CaseCustomerPanelComponent extends Component {
  @service case;
  @service router;
  @service store;

  @tracked isCommentExpanded = false;
  @tracked isMemoExpanded = false;
  @tracked isEnabledEditBuilding = false;
  @tracked isEnabledEditContact = false;
  @tracked telephones = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    if (this.args.model) {
      // TODO use this.args.model.telephones once the relation is defined
      const telephones = yield this.store.query('telephone', {
        'filter[:exact:customer]': this.args.model.uri,
        sort: 'position',
        page: { size: 100 },
      });
      this.telephones = telephones.toArray();
    }
  }

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
  toggleComment() {
    this.isCommentExpanded = !this.isCommentExpanded;
  }

  @action
  toggleMemo() {
    this.isMemoExpanded = !this.isMemoExpanded;
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
