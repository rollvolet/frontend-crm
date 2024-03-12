import Component from '@glimmer/component';
import EmberObject, { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { timeout, restartableTask } from 'ember-concurrency';
import { isBlank } from '@ember/utils';

export default class DataTableFilterComponent extends Component {
  @tracked page = 0;
  @tracked size = 10;
  @tracked sort;

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
    this.filter.set(key, isBlank(value) ? undefined : value);
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
    this.filter.set(key, isBlank(value) ? undefined : value);
    this.onChange(this.filter);
  }

  @action
  setFilterByProperty(key, property, record) {
    const label = isBlank(record) ? undefined : record[property];
    this.filter.set(key, label);
    this.onChange(this.filter);
  }

  @action
  toggleFilter(key) {
    this.filter.set(key, !this.filter[key]);
    this.onChange(this.filter);
  }

  @action
  autofocus(element) {
    element.focus();
  }

  @action
  previousPage() {
    this.selectPage(this.page - 1);
  }

  @action
  nextPage() {
    this.selectPage(this.page + 1);
  }

  @action
  selectPage(page) {
    this.page = page;
    this.search.perform(this.filter);
  }

  @action
  setSort(sort) {
    this.sort = sort;
    this.search.perform(this.filter);
  }
}
