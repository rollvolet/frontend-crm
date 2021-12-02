import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import { action } from '@ember/object';

export default class InputFieldFilterFlagComponent extends Component {
  defaultOptions = [
    { label: 'ja', value: 1, id: `yes-${guidFor(this)}` },
    { label: 'nvt', value: -1, id: `nvt-${guidFor(this)}` },
    { label: 'nee', value: 0, id: `no-${guidFor(this)}` },
  ];

  get group() {
    return this.args.group || `radiogroup-${guidFor(this)}`;
  }

  get options() {
    return this.args.options || this.defaultOptions;
  }

  get nbOfOptions() {
    return this.options.length - 1;
  }

  @action
  selectPrevious(index) {
    const prevIndex = index == 0 ? this.nbOfOptions : index - 1;
    const option = this.options[prevIndex];
    this.selectOption(option);
  }

  @action
  selectNext(index) {
    const nextIndex = index == this.nbOfOptions ? 0 : index + 1;
    const option = this.options[nextIndex];
    this.selectOption(option);
  }

  @action
  selectOption(option) {
    const elementId = `${this.group}-option-${option.id}`;
    document.getElementById(elementId).focus();
    this.args.onChange(option.value);
  }
}
