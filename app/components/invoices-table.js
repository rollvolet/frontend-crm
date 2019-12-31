import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import { observes } from '@ember-decorators/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { task } from 'ember-concurrency';

@classic
@classNames('invoices-table')
export default class InvoicesTable extends Component {
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
  dataTableParamChanged() {
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
