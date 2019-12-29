import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { equal } from '@ember/object/computed';
import Component from '@ember/component';

@classic
export default class ContactsPanel extends Component {
  @service
  store;

  @service
  configuration;

  customer = null;
  state = 'list'; // one of 'list', 'detail', 'edit'

  @equal('state', 'list')
  displayList;

  @equal('state', 'detail')
  displayDetail;

  @equal('state', 'edit')
  displayEdit;

  createNewContact() {
    return this.store.createRecord('contact', {
      printInFront: true,
      printPrefix: true,
      printSuffix: true,
      language: this.configuration.defaultLanguage(),
      country: this.configuration.defaultCountry(),
      customer: this.customer
    });
  }

  @action
  openDetail(contact) {
    this.set('selectedContact', contact);
    this.set('state', 'detail');
  }

  @action
  closeDetail() {
    this.set('state', 'list');
    this.set('selectedContact', null);
  }

  @action
  async openCreate() {
    const contact = this.createNewContact();
    this.set('state', 'edit');
    this.set('selectedContact', contact);
    try { await contact.save(); } catch(e) {} // eslint-disable-line no-empty
  }

  @action
  openEdit(contact) {
    this.set('selectedContact', contact);
    this.set('state', 'edit');
  }

  @action
  closeEdit() {
    this.set('state', 'list');
    this.set('selectedContact', null);
  }
}
