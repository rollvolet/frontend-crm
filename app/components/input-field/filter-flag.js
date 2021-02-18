import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

export default class InputFieldFilterFlagComponent extends Component {
  defaultOptions = [
    { label: 'ja', value: 1, id: `yes-${guidFor(this)}` },
    { label: 'nvt', value: -1, id: `nvt-${guidFor(this)}` },
    { label: 'nee', value: 0, id: `no-${guidFor(this)}` }
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
}
