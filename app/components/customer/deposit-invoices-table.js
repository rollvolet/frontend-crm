import FilterComponent from '../data-table-filter';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import onlyNumericChars from '../../utils/only-numeric-chars';

export default class CustomerDepositInvoicesTableComponent extends FilterComponent {
  @service router;
  @service store;

  @tracked depositInvoices = [];

  constructor() {
    super(...arguments);
    this.initFilter(['number', 'visitor', 'reference', 'name', 'postalCode', 'city', 'street']);
    this.sort = '-number';
    this.search.perform(this.filter);
  }

  onChange(filter) {
    if (this.page != 0) this.page = 0;
    this.search.perform(filter);
  }

  @restartableTask
  *search(filter) {
    this.depositInvoices = yield this.store.query('deposit-invoice', {
      page: {
        size: this.size,
        number: this.page,
      },
      sort: this.sort,
      include: 'building.address.country,case.request.visitor',
      filter: {
        number: onlyNumericChars(filter.number),
        case: {
          customer: {
            ':uri:': this.args.customer.uri,
          },
          building: {
            name: filter.name,
            address: {
              street: filter.street,
              'postal-code': filter.postalCode,
              city: filter.city,
            },
          },
          request: {
            visitor: {
              'first-name': filter.visitor,
            },
          },
          reference: filter.reference,
        },
      },
    });
  }

  @action
  navigateToDetail(depositInvoice) {
    this.router.transitionTo('main.deposit-invoices.edit', depositInvoice.id);
  }
}
