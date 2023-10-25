import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

export default class FilterTextInputComponent extends Component {
  get fieldId() {
    return `filter-text-input-${guidFor(this)}`;
  }
}
