import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import DecimalInputFormatting from '../mixins/decimal-input-formatting';

export default Component.extend(DecimalInputFormatting, {
  classNames: ['layout-row', 'layout-align-start-center'],

  model: null,
  onDelete: null,

  init() {
    this._super(...arguments);
    this.initDecimalInput('amount');
  },

  save: task(function * () {
    yield timeout(1000);
    const { validations } = yield this.model.validate();
    if (validations.isValid)
      yield this.model.save();
  }).keepLatest(),

  actions: {
    delete() {
      this.onDelete(this.model);
    }
  }
});
