import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { warn } from '@ember/debug';

export default class ContactsPanel extends Component {
  @service store;
  @service codelist;
  @service sequence;

  @tracked selectedContact = null;
  @tracked isNewContact = false;

  async createNewContact() {
    const address = this.store.createRecord('address', {
      country: this.codelist.defaultCountry,
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
      language: this.codelist.defaultLanguage,
      address,
      customer: this.args.customer,
    });

    return contact.save();
  }

  @task
  *deleteContact() {
    try {
      const [address, telephones, emails] = yield Promise.all([
        this.selectedContact.address,
        this.selectedContact.telephones,
        this.selectedContact.emails,
      ]);

      const records = [address, ...telephones, ...emails].filter((v) => v);
      yield Promise.all(records.map((t) => t.destroyRecord()));
      yield this.selectedContact.destroyRecord();
      this.closeDetail();
    } catch (e) {
      warn(`Something went wrong while destroying contact ${this.selectedContact.id}`, {
        id: 'destroy-failure',
      });
    }
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
