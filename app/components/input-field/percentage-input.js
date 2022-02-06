import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import formatDecimalInput from '../../utils/format-decimal-input';
import deformatDecimalInput from '../../utils/deformat-decimal-input';

export default class PercentageInputComponent extends Component {
  @tracked formattedValue;

  class = 'default';
  isRequired = false;

  constructor() {
    super(...arguments);
    if (this.args.value) {
      this.formattedValue = formatDecimalInput(this.args.value * 100);
    } else {
      this.formattedValue = null;
    }
  }

  get fieldId() {
    return `percentage-input-${guidFor(this)}`;
  }

  @action
  updateValue(value) {
    const deformattedValue = deformatDecimalInput(value);
    this.formattedValue = formatDecimalInput(deformattedValue);
    if (deformattedValue) {
      this.args.onChange((deformattedValue * 1.0) / 100);
    } else {
      this.args.onChange(null);
    }
  }
}
