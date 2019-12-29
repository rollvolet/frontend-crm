import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import { observes } from '@ember-decorators/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import DebouncedSearch from '../mixins/debounced-search-task';
import '@ember/object';
import { task } from 'ember-concurrency';

@classic
@classNames('invoices-table')
export default class InvoicesTable extends Component.extend(DebouncedSearch) {
  @service
  store;

  init() {
    super.init(...arguments);
    this.set('invoices', []);
  }

  didReceiveAttrs() {
    this.search.perform();
  }

  page = 0;
  size = 10;
  sort = '-number';
  onClickRow = null;

  @observes('page', 'size', 'sort')
  dataTableParamChanged() { // eslint-disable-line ember/no-observers
    this.search.perform();
  }

  @task(function * () {
    const invoices = yield this.store.query('invoice', {
      page: {
        size: this.size,
        number: this.page
      },
      sort: this.sort,
      include: 'building'
    });
    this.set('invoices', invoices);
  })
  search;
}
