import classic from 'ember-classic-decorator';
import { tagName } from '@ember-decorators/component';
import { action } from '@ember/object';
import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';

@classic
@tagName('')
export default class DataTableFilter extends Component {
  filterKeys = Object.freeze([])

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    for (let key of this.filterKeys) {
      const value = this.get(key);
      this.set(`${key}Filter`, value);
    }
  }

  didInsertElement() {
    super.didInsertElement(...arguments);
    const el = document.querySelector('.search-autofocus input');  // TODO replace with autofocus modifier
    if (el)
      el.focus();
  }

  getFilter() {
    const filter = {};
    for (let key of this.filterKeys) {
      filter[key] = this.get(`${key}Filter`);
    }
    return filter;
  }

  @(task(function * (key, value) {
    this.set(`${key}Filter`, value);
    yield timeout(500);
    this.onChange(this.getFilter());
  }).restartable())
  debounceFilter;

  @action
  resetFilters() {
    this.filterKeys.forEach(key => this.set(`${key}Filter`, undefined));
    this.onChange(this.getFilter());
  }

  @action
  setFilter(key, value) {
    this.set(`${key}Filter`, value);
    this.onChange(this.getFilter());
  }
}
