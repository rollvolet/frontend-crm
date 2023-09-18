import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

export default class InvoiceTableComponent extends Component {
  @service store;

  @tracked page = 0;
  @tracked size = 10;
  @tracked sort = '-number';
  @tracked invoices = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @restartableTask
  *loadData() {
    this.invoices = yield this.store.query('invoice', {
      page: {
        size: this.size,
        number: this.page,
      },
      sort: this.sort,
      include: 'customer.address.country,building.address.country,case',
    });
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
    this.loadData.perform();
  }

  @action
  setSort(sort) {
    this.sort = sort;
    this.loadData.perform();
  }
}
