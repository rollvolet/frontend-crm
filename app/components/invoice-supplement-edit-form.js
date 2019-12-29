import classic from 'ember-classic-decorator';
import Component from '@ember/component';
import DecimalInputFormatting from '../mixins/decimal-input-formatting';

@classic
export default class InvoiceSupplementEditForm extends Component.extend(DecimalInputFormatting) {
  model = null;

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);

    if (this.model) {
      this.initDecimalInput('amount');
      this.initDecimalInput('nbOfPieces');
    }
  }
}
