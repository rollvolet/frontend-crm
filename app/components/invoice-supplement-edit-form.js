import Component from '@ember/component';
import DecimalInputFormatting from '../mixins/decimal-input-formatting';

export default Component.extend(DecimalInputFormatting, {
  model: null,

  didReceiveAttrs() {
    this._super(...arguments);

    if (this.model) {
      this.initDecimalInput('amount');
      this.initDecimalInput('nbOfPieces');
    }
  }
});
