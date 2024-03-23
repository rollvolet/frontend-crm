import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import formatVatNumber from '../../utils/format-vat-number';
import deformatVatNumber from '../../utils/deformat-vat-number';

export default class VatNumberInputComponent extends Component {
  @tracked _value;

  constructor() {
    super(...arguments);
    this._value = formatVatNumber(this.args.value) || 'BE ';
  }

  get elementId() {
    return `vat-number-input-${guidFor(this)}`;
  }

  get isDuplicateVatNumber() {
    return this.args.errors.find((error) => error.type == 'uniqueVatNumber');
  }

  @action
  updateInput(event) {
    this._value = event.target.value;
    const deformattedValue = deformatVatNumber(this._value);
    this.args.onChange(deformattedValue);
  }

  @action
  changeValue() {
    const deformattedValue = deformatVatNumber(this._value);
    this._value = formatVatNumber(deformattedValue); // only format on focusout
    this.args.onBlur();
  }
}
