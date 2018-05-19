import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { equal } from '@ember/object/computed';

export default Component.extend({
  store: service(),

  customer: null,
  state: 'list', // one of 'list', 'detail', 'create', 'edit'
  displayList: equal('state', 'list'),
  displayDetail: equal('state', 'detail'),
  displayCreate: equal('state', 'create'),
  displayEdit: equal('state', 'edit'),

  createNewContact() {
    const defaultLanguage = this.store.peekAll('language').find(l => l.get('code') == 'NED');
    const defaultCountry = this.store.peekAll('country').find(c => c.get('code') == 'BE');
    const contact = this.store.createRecord('contact', {
      printInFront: true,
      printPrefix: true,
      printSuffix: true,
      language: defaultLanguage,
      country: defaultCountry,
      customer: this.customer
    });
    return contact.save();
  },

  actions: {
    openDetail(contact) {
      this.set('selectedContact', contact);
      this.set('state', 'detail');
    },
    closeDetail() {
      this.set('state', 'list');
      this.set('selectedContact', null);
    },
    async openCreate() {
      const contact = await this.createNewContact();
      this.set('selectedContact', contact);
      this.set('state', 'create');
    },
    openEdit(contact) {
      this.set('selectedContact', contact);
      this.set('state', 'edit');
    },
    closeEdit() {
      this.set('state', 'list');
      this.set('selectedContact', null);
    }
  }
});
