import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import { observes } from '@ember-decorators/object';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import FilterComponent from '../data-table-filter';
import { task } from 'ember-concurrency';

@classic
@classNames('deposit-invoices-table')
export default class DepositInvoicesTable extends FilterComponent {
  @service
  router;

  @service
  store;

  page = 0;
  size = 10;
  sort = '-number';
  filterKeys = Object.freeze(['number', 'reference', 'name', 'postalCode', 'city', 'street'])

  init() {
    super.init(...arguments);
    this.search.perform(this.getFilter());
  }

  async onChange(filter) {
    await this.search.perform(filter);
  }

  @observes('page', 'size', 'sort')
  dataTableParamChanged() { // eslint-disable-line ember/no-observers
    this.search.perform(this.getFilter());
  }

  @task(function * (filter) {
    const invoices = yield this.store.query('depositInvoice', {
      page: {
        size: this.size,
        number: this.page
      },
      sort: this.sort,
      include: 'order,building',
      filter: {
        customer: {
          number: this.customer.number
        },
        number: filter.number,
        reference: filter.reference,
        building: {
          name: filter.name,
          'postal-code': filter.postalCode,
          city: filter.city,
          street: filter.street
        }
      }
    });
    this.set('depositInvoices', invoices);
  })
  search;

  @action
  clickRow(row) {
    const orderId = row.get('order.id');
    this.router.transitionTo('main.case.order.edit.deposit-invoices', this.customer, orderId);
  }
}
