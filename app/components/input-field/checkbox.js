import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class InputFieldCheckboxComponent extends Component {
  get onValue() {
    return true;
  }

  get offValue() {
    return false;
  }

  get isOn() {
    return this.args.value == this.onValue;
  }

  get isOff() {
    return !this.isOn;
  }

  @action
  toggleValue(event) {
    const newValue = event.target.checked ? this.onValue : this.offValue;
    this.args.onChange(newValue);
  }
}
