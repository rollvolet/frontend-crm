import Controller from '@ember/controller';
import { task } from 'ember-concurrency';

export default Controller.extend({
  queryParams: ['editMode'],
  editMode: false,

  employee: null,

  isValid() {
    // TODO implement
    return true;
  },

  save: task(function * () {
    if (!this.isValid())
      throw new Error(`Invalid request`);
    yield this.model.save();
  }).keepLatest(),

  actions: {
    setEmployee(employee) {
      this.set('employee', employee);
      const firstName = employee ? employee.firstName : null;
      this.model.set('employee', firstName);
    }
  }
});
