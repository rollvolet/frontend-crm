import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import formatVatNumber from '../../utils/format-vat-number';
import deformatVatNumber from '../../utils/deformat-vat-number';

export default class VatNumberInputComponent extends Component {
  get formattedValue() {
    if (this.args.value)
      return formatVatNumber(this.args.value);
    else
      return 'BE 0';
  }

  get elementId() {
    return `vat-number-input-${guidFor(this)}`;
  }

  @action
  updateValue(event) {
    const deformattedValue = deformatVatNumber(event.target.value);
    this.args.onChange(deformattedValue);
  }
}
