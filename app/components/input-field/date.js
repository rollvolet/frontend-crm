import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { unlocalize } from '../../utils/date-helpers';

export default class InputFieldDateComponent extends Component {
  get fieldId() {
    return `date-input-${guidFor(this)}`;
  }

  @action
  updateValue(dates) {
    const date = unlocalize(dates[0]);
    this.args.onChange(date);
  }
}
