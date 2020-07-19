import FilterComponent from '../data-table-filter';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency-decorators';

export default class CertificateRecycleComponent extends FilterComponent {
  @service store
  @service case

  @tracked invoices = []
  @tracked scope = 'invoice'

  constructor() {
    super(...arguments);
    this.initFilter(['number', 'reference', 'cName', 'cPostalCode', 'cCity', 'cStreet', 'cTelephone', 'bName', 'bPostalCode', 'bCity', 'bStreet']);
    this.filter.set('page', 0);
    this.filter.set('size', 10);
    this.filter.set('sort', '-number');
    this.filter.set('cName', this.case.current.customer && this.case.current.customer.name);

    // Setup observers for 2-way binded values of ember-data-table
    this.filter.addObserver('page', this, 'onDataTableParamChange'); // eslint-disable-line ember/no-observers
    this.filter.addObserver('size', this, 'onDataTableParamChange'); // eslint-disable-line ember/no-observers
    this.filter.addObserver('sort', this, 'onDataTableParamChange'); // eslint-disable-line ember/no-observers
    this.search.perform(this.filter);
  }

  onChange(filter) {
    if (filter.page != 0)
      filter.set('page', 0); // search will be triggered by onDataTableParamChange()
    else
      this.search.perform(filter);
  }

  onDataTableParamChange() {
    this.search.perform(this.filter);
  }

  willDestroy() {
    this.filter.removeObserver('page', this, 'onDataTableParamChange');
    this.filter.removeObserver('size', this, 'onDataTableParamChange');
    this.filter.removeObserver('sort', this, 'onDataTableParamChange');
  }

  @restartableTask
  *search(filter) {
    this.invoices = yield this.store.query(this.scope, {
      page: {
        size: filter.size,
        number: filter.page
      },
      sort: filter.sort,
      include: 'building',
      filter: {
        'certificate-received': true,
        customer: {
          name: filter.cName
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
  }

  @action
  changeScope(scope) {
    this.scope = scope;
    this.onChange(this.filter);
  }
}
