import Component from '@glimmer/component';
import { action } from '@ember/object';
import formatVatNumber from '../../utils/format-vat-number';
import deformatVatNumber from '../../utils/deformat-vat-number';

export default class VatNumberInputComponent extends Component {
  get label() {
    return this.args.label || 'BTW nummer';
  }

  get formattedValue() {
    return formatVatNumber(this.args.value);
  }

  @action
  updateValue(value) {
    const deformattedValue = deformatVatNumber(value);
    this.args.onChange(deformattedValue);
  }
}
