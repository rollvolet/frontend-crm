import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ContactsPanel extends Component {
  @service store;
  @service configuration;
  @service sequence;

  @tracked selectedContact = null;
  @tracked isNewContact = false;

  async createNewContact() {
    const address = this.store.createRecord('address', {
      country: this.configuration.defaultCountry,
    });
    const [position] = await Promise.all([
      this.sequence.fetchNextContactPosition(this.args.customer),
      address.save(),
    ]);
    const contact = this.store.createRecord('contact', {
      position,
      printInFront: true,
      printPrefix: true,
      printSuffix: true,
      language: this.configuration.defaultLanguage,
      address,
      customer: this.args.customer,
    });

    return contact.save();
  }

  @action
  openDetail(contact) {
    this.selectedContact = contact;
  }

  @action
  closeDetail() {
    this.selectedContact = null;
    this.isNewContact = false;
  }

  @action
  async openCreate() {
    try {
      const contact = await this.createNewContact();
      this.selectedContact = contact;
      this.isNewContact = true;
    } catch (e) {} // eslint-disable-line no-empty
  }
}
