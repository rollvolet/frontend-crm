import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import formatDecimalInput from '../../utils/format-decimal-input';
import deformatDecimalInput from '../../utils/deformat-decimal-input';

export default class DecimalInputComponent extends Component {
  @tracked formattedValue

  constructor() {
    super(...arguments);
    this.formattedValue = formatDecimalInput(this.args.value);
  }

  @action
  updateValue(value) {
    const deformattedValue = deformatDecimalInput(value);
    this.formattedValue = formatDecimalInput(deformattedValue);
    this.args.onChange(deformattedValue);
  }
}
