import FilterComponent from '../data-table-filter';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import onlyNumericChars from '../../utils/only-numeric-chars';
import formatOfferNumber from '../../utils/format-offer-number';

export default class OffersTable extends FilterComponent {
  @service router;
  @service store;

  @tracked page = 0;
  @tracked size = 10;
  @tracked sort = '-offer-date';
  @tracked offers = [];

  constructor() {
    super(...arguments);
    this.initFilter([
      'requestNumber',
      'number',
      'reference',
      'name',
      'postalCode',
      'city',
      'street',
    ]);
    this.search.perform(this.filter);
  }

  // @overwrite
  onChange(filter) {
    if (this.page != 0) this.page = 0;
    this.search.perform(filter);
  }

  @restartableTask
  *search(filter) {
    this.offers = yield this.store.query('offer', {
      page: {
        size: this.size,
        number: this.page,
      },
      sort: this.sort,
      include: 'building,request',
      filter: {
        customer: {
          number: this.args.customer.number,
        },
        'request-number': onlyNumericChars(filter.requestNumber),
        number: formatOfferNumber(filter.number),
        reference: filter.reference,
        building: {
          name: filter.name,
          'postal-code': filter.postalCode,
          city: filter.city,
          street: filter.street,
        },
      },
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
    this.search.perform(this.filter);
  }

  @action
  setSort(sort) {
    this.sort = sort;
    this.search.perform(this.filter);
  }

  @action
  navigateToDetail(offer) {
    this.router.transitionTo('main.offers.edit', offer.id);
  }
}
