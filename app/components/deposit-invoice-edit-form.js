import Component from '@ember/component';
import DecimalInputFormatting from '../mixins/decimal-input-formatting';

export default Component.extend(DecimalInputFormatting, {
  model: null,
  save: null,

  init() {
    this._super(...arguments);
    this.initDecimalInput('baseAmount');
  }
});
