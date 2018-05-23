import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Controller.extend({
  validation: service(),

  queryParams: ['editMode'],
  editMode: false,

  isValid() {
    return this.validation.required(this.model.get('requestDate'), 'Datum');
  },

  save: task(function * () {
    if (!this.isValid())
      throw new Error(`Invalid request`);
    yield this.model.save();
  }).keepLatest()
});
