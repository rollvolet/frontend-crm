import Component from '@ember/component';
import { equal } from '@ember/object/computed';

export default Component.extend({
  customer: null,
  state: 'list', // one of 'list', 'detail', 'create'
  displayList: equal('state', 'list'),
  displayDetail: equal('state', 'detail'),
  displayCreate: equal('state', 'create'),

  actions: {
    openDetail(building) {
      this.set('selectedBuilding', building);
      this.set('state', 'detail');
    },
    closeDetail() {
      this.set('state', 'list');
      this.set('selectedBuilding', null);
    },
    openCreate() {
      this.set('state', 'create');
    },
    closeCreate() {
      this.set('state', 'list');
    }
  }
});
