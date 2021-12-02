import FilterComponent from '../data-table-filter';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { later } from '@ember/runloop';
import { restartableTask } from 'ember-concurrency-decorators';
import { isBlank } from '@ember/utils';

export default class CertificateSearchModalComponent extends FilterComponent {
  @service store;
  @service case;

  @tracked page = 0;
  @tracked size = 10;
  @tracked sort = '-number';
  @tracked scope = 'invoice';
  @tracked showModalContent = true;
  @tracked invoices = [];

  constructor() {
    super(...arguments);
    this.initFilter([
      'number',
      'reference',
      'cName',
      'cPostalCode',
      'cCity',
      'cStreet',
      'cTelephone',
      'bName',
      'bPostalCode',
      'bCity',
      'bStreet',
    ]);
    this.filter.set('cName', this.case.current.customer && this.case.current.customer.name);
    this.search.perform(this.filter);
  }

  onChange(filter) {
    if (this.page != 0) this.page = 0;
    this.search.perform(filter);
  }

  @restartableTask
  *search(filter) {
    const apiFilter = {
      'certificate-received': true,
      number: filter.number,
      offer: {
        number: filter.offerNumber,
        'request-number': filter.requestNumber,
      },
      customer: {
        name: filter.cName,
        'postal-code': filter.cPostalCode,
        city: filter.cCity,
        street: filter.cStreet,
      },
      building: {
        name: filter.bName,
        'postal-code': filter.bPostalCode,
        city: filter.bCity,
        street: filter.bStreet,
      },
    };

    if (!isBlank(filter.reference)) apiFilter['reference'] = filter.reference;

    this.invoices = yield this.store.query(this.scope, {
      page: {
        size: this.size,
        number: this.page,
      },
      sort: this.sort,
      include: 'building',
      filter: apiFilter,
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

  @action
  setScope(scope) {
    this.scope = scope;
    this.search.perform(this.filter);
  }
}
