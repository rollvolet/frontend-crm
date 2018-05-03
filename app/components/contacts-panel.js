import Component from '@ember/component';
import { equal } from '@ember/object/computed';

export default Component.extend({
  customer: null,
  state: 'list', // one of 'list', 'detail', 'create'
  displayList: equal('state', 'list'),
  displayDetail: equal('state', 'detail'),
  displayCreate: equal('state', 'create'),

  actions: {
    openDetail(contact) {
      this.set('selectedContact', contact);
      this.set('state', 'detail');
    },
    closeDetail() {
      this.set('state', 'list');
      this.set('selectedContact', null);
    },
    openCreate() {
      this.set('state', 'create');
    },
    closeCreate() {
      this.set('state', 'list');
    }
  }
});
