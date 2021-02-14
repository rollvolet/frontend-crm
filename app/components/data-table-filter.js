import Component from '@glimmer/component';
import EmberObject, { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';

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
    // TODO remove value = event once all data filters are refactored
    // not to use PaperInput anymore
    const value = event.target ? event.target.value : event;
    this.filter.set(key, value);
    yield timeout(500);
    this.onChange(this.filter);
  }

  @action
  resetFilters() {
    this.filterKeys.forEach(key => this.filter.set(key, undefined));
    this.onChange(this.filter);
  }

  @action
  setFilter(key, value) {
    this.filter.set(key, value);
    this.onChange(this.filter);
  }

  @action
  autofocus(element) {
    // TODO remove element.querySelector('input ) once all data filters are refactored
    // not to use PaperInput anymore
    const inputEl = element.tagName == 'INPUT' ? element : element.querySelector('input');
    if (inputEl) {
      // If we don't delay .focus(), another element seems to gain the final focus
      // By postponing the .focus() action 1ms, the correct input element gets focus
      setTimeout(() => {
        inputEl.focus();
      }, 1);
    }
  }
}
