import classic from 'ember-classic-decorator';
import { observes } from '@ember-decorators/object';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import FilterComponent from '../data-table-filter';
import { task } from 'ember-concurrency';

@classic
export default class InvoicesTable extends FilterComponent {
  @service router;

  @service store;

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
    const invoices = yield this.store.query('invoice', {
      page: {
        size: this.size,
        number: this.page
      },
      sort: this.sort,
      include: 'building',
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
    this.set('invoices', invoices);
  })
  search;

  @action
  clickRow(row) {
    const invoiceId = row.get('id');
    this.router.transitionTo('main.case.invoice.edit', this.customer, invoiceId);
  }

  @action
  openNewInvoice() {
    this.router.transitionTo('main.case.invoice.new', this.customer);
  }
}
