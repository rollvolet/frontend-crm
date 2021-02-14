import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class InputFieldSwitchComponent extends Component {
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
  toggleValue() {
    const newValue = this.isOn ? this.offValue : this.onValue;
    this.args.onChange(newValue);
  }
}
