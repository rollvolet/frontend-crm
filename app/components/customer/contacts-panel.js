import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ContactsPanel extends Component {
  @service store;
  @service configuration;

  @tracked selectedContact = null;

  createNewContact() {
    return this.store.createRecord('contact', {
      printInFront: true,
      printPrefix: true,
      printSuffix: true,
      language: this.configuration.defaultLanguage,
      country: this.configuration.defaultCountry,
      customer: this.args.customer
    });
  }

  @action
  openDetail(contact) {
    this.selectedContact = contact;
  }

  @action
  closeDetail() {
    this.selectedContact = null;
  }

  @action
  async openCreate() {
    const contact = this.createNewContact();
    this.selectedContact = contact;
    try { await contact.save(); } catch(e) {} // eslint-disable-line no-empty
  }
}
