import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import DecimalInputFormatting from '../mixins/decimal-input-formatting';
import { exec } from 'pell';

export default Component.extend(DecimalInputFormatting, {
  classNames: ['layout-row', 'layout-align-start-center'],

  model: null,
  onDelete: null,
  pellOptions: null,

  init() {
    this._super(...arguments);
    this.initDecimalInput('amount');
    this.set('pellOptions', {
      actions: [
        'bold', 'underline', 'italic', 'strikethrough', 'olist', 'ulist',
        {
          name: 'subscript',
          icon: 'x<sub>2</sub>',
          title: 'Subscript',
          result: () => exec('subscript')
        },
        {
          name: 'superscript',
          icon: 'x<sup>2</sup>',
          title: 'Superscript',
          result: () => exec('superscript')
        }
      ]
    });
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
