import Component from '@glimmer/component';
import EmberObject, { action } from '@ember/object';
import { timeout, restartableTask } from 'ember-concurrency';

export default class DataTableFilterComponent extends Component {
  initFilter(filterKeys) {
    this.filterKeys = filterKeys;
    this.filter = EmberObject.create();
    for (let key of this.filterKeys) {
      const value = this.args[key];
      this.filter.set(key, value);
    }
  }

  onChange(filter) {
    this.args.onChange(filter);
  }

  @restartableTask
  *debounceFilter(key, event) {
    const value = event.target.value;
    this.filter.set(key, value);
    yield timeout(500);
    this.onChange(this.filter);
  }

  @action
  resetFilters() {
    this.filterKeys.forEach((key) => this.filter.set(key, undefined));
    this.onChange(this.filter);
  }

  @action
  setFilter(key, value) {
    this.filter.set(key, value);
    this.onChange(this.filter);
  }

  @action
  autofocus(element) {
    element.focus();
  }
}
