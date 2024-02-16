import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { hash } from 'rsvp';
import subYears from 'date-fns/subYears';
import formatISO from 'date-fns/formatISO';
import Snapshot from '../../../../utils/snapshot';
import search from '../../../../utils/mu-search';
import MuSearchFilter from '../../../../utils/mu-search-filter';
import constants from '../../../../config/constants';

const { CASE_STATUSES } = constants;

export default class MainReportsOutstandingJobsIndexRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    visitorUri: { refreshModel: true },
    orderDate: { refreshModel: true }, // format yyyy-mm-dd
    hasProductionTicket: { refreshModel: true },
    deliveryMethodUri: { refreshModel: true },
    isProductReady: { refreshModel: true },
  };

  sortFieldOptions = [
    { label: 'Besteldatum', value: 'order-date' },
    { label: 'Verwachte datum', value: 'expected-date' },
    { label: 'Vereiste datum', value: 'due-date' },
    { label: 'Geplande datum', value: 'planned-date' },
  ];

  sortDirectionOptions = [
    { label: 'Nieuwste eerst', value: 'desc' },
    { label: 'Oudste eerst', value: 'asc' },
  ];

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  async model(params) {
    if (!params.orderDate) {
      const yearAgo = subYears(new Date(), 1);
      params.orderDate = formatISO(yearAgo, { representation: 'date' });
    }

    this.lastParams.stageLive(params);

    // Reset page number if any of the filters has changed
    const paramHasChanged = this.lastParams.anyFieldChanged(
      Object.keys(params).filter((key) => key !== 'page')
    );
    if (paramHasChanged) {
      params.page = 0;
    }

    let visitor;
    if (params.visitorUri) {
      visitor = await this.store.findRecordByUri('employee', params.visitorUri);
    }

    const filter = new MuSearchFilter({
      ':gt:orderDate': params.orderDate,
      'case.status': CASE_STATUSES.ONGOING,
      deliveryMethodUri: params.deliveryMethodUri,
      visitorName: visitor?.firstName,
    });

    filter.setFilterFlag('isReady', params.isProductReady);
    filter.setFilterFlag('hasProductionTicket', params.hasProductionTicket);
    filter.noExistance('invoiceId');

    const orders = await search('orders', params.page, params.size, params.sort, filter.value);

    const numberOverdueFilter = JSON.parse(JSON.stringify(filter.value)); // TODO use a decent deep clone method
    numberOverdueFilter[':lt:dueDate'] = formatISO(new Date(), { representation: 'date' });
    const numberOverdue = await search('orders', 0, 1, params.sort, numberOverdueFilter);

    this.lastParams.commit();

    return hash({
      orders,
      report: {
        numberOverdue: numberOverdue.meta.count,
      },
    });
  }

  async afterModel() {
    const params = this.lastParams.committed;
    this.orderDate = params.orderDate;

    this.orderDate = params.orderDate;

    // Preload selected values value for ember-power-select
    if (params.visitorUri) {
      this.visitor = await this.store.findRecordByUri('employee', params.visitorUri);
    } else {
      this.visitor = null;
    }

    if (params.deliveryMethodUri) {
      this.deliveryMethod = await this.store.findRecordByUri('concept', params.deliveryMethodUri);
    } else {
      this.deliveryMethod = null;
    }

    if (params.sort) {
      if (params.sort.startsWith('-')) {
        this.sortDirection = this.sortDirectionOptions.find((o) => o.value == 'desc');
        this.sortField = this.sortFieldOptions.find((o) => o.value == params.sort.slice(1));
      } else {
        this.sortDirection = this.sortDirectionOptions.find((o) => o.value == 'asc');
        this.sortField = this.sortFieldOptions.find((o) => o.value == params.sort);
      }
    }
  }

  setupController(controller) {
    super.setupController(...arguments);

    controller.sortDirectionOptions = this.sortDirectionOptions;
    controller.sortFieldOptions = this.sortFieldOptions;

    controller.orderDate = this.orderDate;
    controller.visitor = this.visitor;
    controller.deliveryMethod = this.deliveryMethod;
    controller.sortDirection = this.sortDirection;
    controller.sortField = this.sortField;

    if (controller.page != this.lastParams.committed.page) {
      controller.page = this.lastParams.committed.page;
    }
  }
}
