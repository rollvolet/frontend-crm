import FilterComponent from '../data-table-filter';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { later } from '@ember/runloop';
import { restartableTask } from 'ember-concurrency';

export default class InterventionOrderSearchModalComponent extends FilterComponent {
  @service router;
  @service store;

  @tracked page = 0;
  @tracked size = 10;
  @tracked sort = '-order-date';
  @tracked orders = [];

  @tracked showModalContent = true;

  constructor() {
    super(...arguments);
    this.initFilter([
      'requestNumber',
      'offerNumber',
      'reference',
      'name',
      'postalCode',
      'city',
      'street',
    ]);
    this.initSearch();
  }

  onChange(filter) {
    if (this.page != 0) this.page = 0;
    this.search.perform(filter);
  }

  async initSearch() {
    const customer = await this.args.model.customer;
    this.filter.set('name', customer.name);
    this.search.perform(this.filter);
  }

  @restartableTask
  *search(filter) {
    this.orders = yield this.store.query('order', {
      page: {
        size: this.size,
        number: this.page,
      },
      sort: this.sort,
      include: 'customer,offer',
      filter: {
        customer: {
          name: filter.name,
          'postal-code': filter.postalCode,
          city: filter.city,
          street: filter.street,
        },
        'request-number': filter.requestNumber,
        'offer-number': filter.offerNumber,
        reference: filter.reference,
      },
    });
  }

  @action
  closeModal() {
    this.showModalContent = false;
    later(
      this,
      function () {
        this.args.onClose();
      },
      200
    ); // delay to finish leave CSS animation
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
