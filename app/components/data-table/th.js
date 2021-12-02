import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class DataTableThComponent extends Component {
  get dasherizedField() {
    return this.args.field.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  get isAscending() {
    return this.args.currentSort == this.dasherizedField;
  }

  get isDescending() {
    return this.args.currentSort == `-${this.dasherizedField}`;
  }

  /**
     Note: the current sorting parameter may contain another field than the given field of this table header.
     In case the given field is currently sorted ascending, change to descending.
     In case the given field is currently sorted descending, clean the sorting.
     Else, set the sorting to ascending on the given field.
  */
  @action
  updateSort() {
    if (this.isAscending) {
      this.args.onUpdateSort(`-${this.dasherizedField}`);
    } else if (this.isDescending) {
      this.args.onUpdateSort('');
    } else {
      this.args.onUpdateSort(this.dasherizedField);
    }
  }
}
