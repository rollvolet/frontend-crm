import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ContactsPanel extends Component {
  @service store
  @service configuration

  @tracked state = 'list' // one of 'list', 'detail', 'edit'
  @tracked selectedContact = null

  get displayList() {
    return this.state == 'list';
  }

  get displayDetail() {
    return this.state == 'detail';
  }

  get displayEdit() {
    return this.state == 'edit';
  }

  createNewContact() {
    return this.store.createRecord('contact', {
      printInFront: true,
      printPrefix: true,
      printSuffix: true,
      language: this.configuration.defaultLanguage(),
      country: this.configuration.defaultCountry(),
      customer: this.args.customer
    });
  }

  @action
  openDetail(contact) {
    this.selectedContact = contact;
    this.state = 'detail';
  }

  @action
  closeDetail() {
    this.state = 'list';
    this.selectedContact = null;
  }

  @action
  async openCreate() {
    const contact = this.createNewContact();
    this.state = 'edit';
    this.selectedContact = contact;
    try { await contact.save(); } catch(e) {} // eslint-disable-line no-empty
  }

  @action
  openEdit(contact) {
    this.selectedContact = contact;
    this.state = 'edit';
  }

  @action
  closeEdit() {
    this.state = 'list';
    this.selectedContact = null;
  }
}
