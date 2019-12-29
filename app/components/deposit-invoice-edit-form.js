import classic from 'ember-classic-decorator';
import Component from '@ember/component';
import DecimalInputFormatting from '../mixins/decimal-input-formatting';

@classic
export default class DepositInvoiceEditForm extends Component.extend(DecimalInputFormatting) {
  model = null;
  save = null;

  init() {
    super.init(...arguments);
    this.initDecimalInput('baseAmount');
  }
}
