import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),

  model: null,
  employee: null,
  save: null,

  init() {
    this._super(...arguments);
    if (this.model.employee) {
      const employee = this.store.peekAll('employee').find(e => e.firstName == this.model.employee);
      this.set('employee', employee);
    }
  },

  actions: {
    setEmployee(employee) {
      this.set('employee', employee);
      const firstName = employee ? employee.firstName : null;
      this.model.set('employee', firstName);
    }
  }
});
