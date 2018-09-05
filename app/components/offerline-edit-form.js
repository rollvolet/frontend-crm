import Component from '@ember/component';
import { task } from 'ember-concurrency';
import DecimalInputFormatting from '../mixins/decimal-input-formatting';
import PellOptions from '../mixins/pell-options';

export default Component.extend(DecimalInputFormatting, PellOptions, {
  classNames: ['layout-row', 'layout-align-start-center'],

  model: null,
  onDelete: null,

  init() {
    this._super(...arguments);
    this.initDecimalInput('amount');
  },

  save: task(function * () {
    const { validations } = yield this.model.validate();
    if (validations.isValid)
      yield this.model.save();
  }),

  actions: {
    delete() {
      this.onDelete(this.model);
    }
  }
});
