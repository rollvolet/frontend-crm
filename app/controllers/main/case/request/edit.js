import Controller from '@ember/controller';
import { task } from 'ember-concurrency';

export default Controller.extend({
  queryParams: ['editMode'],
  editMode: false,

  isValid() {
    // TODO implement
    return true;
  },

  save: task(function * () {
    if (!this.isValid())
      throw new Error(`Invalid request`);
    yield this.model.save();
  }).keepLatest()
});
