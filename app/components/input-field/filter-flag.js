import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

export default class InputFieldFilterFlagComponent extends Component {
  options = [
    { label: 'n.v.t.', value: -1, id: `nvt-${guidFor(this)}` },
    { label: 'ja', value: 1, id: `yes-${guidFor(this)}` },
    { label: 'nee', value: 0, id: `no-${guidFor(this)}` }
  ];

  get group() {
    return this.args.group || `group-${guidFor(this)}`;
  }
}
