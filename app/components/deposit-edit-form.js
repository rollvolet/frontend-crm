import classic from 'ember-classic-decorator';
import Component from '@ember/component';
import DecimalInputFormatting from '../mixins/decimal-input-formatting';

@classic
export default class DepositEditForm extends Component.extend(DecimalInputFormatting) {
  model = null;
  save = null;

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);

    if (this.model)
      this.initDecimalInput('amount');
  }
}
