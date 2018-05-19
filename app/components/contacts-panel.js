import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { equal } from '@ember/object/computed';

export default Component.extend({
  store: service(),
  configuration: service(),

  customer: null,
  state: 'list', // one of 'list', 'detail', 'create', 'edit'
  displayList: equal('state', 'list'),
  displayDetail: equal('state', 'detail'),
  displayCreate: equal('state', 'create'),
  displayEdit: equal('state', 'edit'),

  createNewContact() {
    return this.store.createRecord('contact', {
      printInFront: true,
      printPrefix: true,
      printSuffix: true,
      language: this.configuration.defaultLanguage(),
      country: this.configuration.defaultCountry(),
      customer: this.customer
    });
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
      const contact = this.createNewContact();
      try { await contact.save(); } catch(e) {};
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
