import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import filterFlagToBoolean from '../../../../utils/filter-flag-to-boolean';
import constants from '../../../../config/constants';

const { CASE_STATUSES } = constants;

export default class MainReportsOutstandingJobsPrintRoute extends Route {
  @service store;

  queryParams = {
    visitorUri: { refreshModel: true },
    orderDate: { refreshModel: true }, // format yyyy-mm-dd
    hasProductionTicket: { refreshModel: true },
    deliveryMethodUri: { refreshModel: true },
    isProductReady: { refreshModel: true },
  };

  async model(params) {
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
      this.deliveryMethod = await this.store.findRecordByUri('concept', params.deliveryMethodUri);
    } else {
      this.deliveryMethod = null;
    }

    if (params.visitorUri) {
      filter['case']['request'] = {
        visitor: {
          ':uri:': params.visitorUri,
        },
      };
      this.visitor = await this.store.findRecordByUri('employee', params.visitorUri);
    } else {
      this.visitor = null;
    }

    return this.store.query('order', {
      page: {
        size: 500, // for printing we need all entries
        number: 0,
      },
      sort: '-order-date',
      include: ['case.request.visitor', 'case.customer.address', 'case.building.address'].join(','),
      filter,
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.visitor = this.visitor;
    controller.deliveryMethod = this.deliveryMethod;
  }
}
