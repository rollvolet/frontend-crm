import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import subYears from 'date-fns/subYears';
import formatISO from 'date-fns/formatISO';
import Snapshot from '../../../../utils/snapshot';
import filterFlagToBoolean from '../../../../utils/filter-flag-to-boolean';
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
    { label: 'Geplande datum', value: 'planning.date' },
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

    const filter = {
      ':gt:order-date': params.orderDate,
      case: {
        status: CASE_STATUSES.ONGOING,
      },
    };

    filter['is-ready'] = filterFlagToBoolean(params.isProductReady);
    filter['case']['has-production-ticket'] = filterFlagToBoolean(params.hasProductionTicket);
    if (params.deliveryMethodUri) {
      filter['case']['delivery-method'] = {
        ':uri:': params.deliveryMethodUri,
      };
    }
    if (params.visitorUri) {
      filter['case']['request'] = {
        visitor: {
          ':uri:': params.visitorUri,
        },
      };
    }

    const orders = await this.store.query('order', {
      page: {
        size: params.size,
        number: params.page,
      },
      sort: params.sort,
      include: ['case.request.visitor', 'case.customer.address', 'case.building.address'].join(','),
      filter,
    });

    const numberOverdueFilter = JSON.parse(JSON.stringify(filter)); // TODO use a decent deep clone method
    numberOverdueFilter[':lt:due-date'] = formatISO(new Date(), { representation: 'date' });
    const numberOverdue = await this.store.count('order', {
      sort: params.sort,
      filter: numberOverdueFilter,
    });

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

    this.lastParams.commit();

    return hash({
      orders,
      report: {
        numberOverdue,
      },
    });
  }

  setupController(controller) {
    super.setupController(...arguments);

    controller.sortDirectionOptions = this.sortDirectionOptions;
    controller.sortFieldOptions = this.sortFieldOptions;

    controller.visitor = this.visitor;
    controller.deliveryMethod = this.deliveryMethod;
    controller.sortDirection = this.sortDirection;
    controller.sortField = this.sortField;

    if (controller.page != this.lastParams.committed.page) {
      controller.page = this.lastParams.committed.page;
    }
  }
}
