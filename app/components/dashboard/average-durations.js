import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import differenceInDays from 'date-fns/differenceInDays';
import config from '../../config';
import constants from '../../config/constants';
import median from '../../utils/math/median';

const { PAGE_SIZE } = config;
const { DELIVERY_METHODS } = constants;

export default class DashboardOutstandingJobsComponent extends Component {
  @service store;

  @tracked averagePlacementDuration;
  @tracked averageInterventionDuration;

  constructor() {
    super(...arguments);
    this.calculateAveragePlacementDuration.perform();
    this.calculateAverageInterventionDuration.perform();
  }

  get averagePlacementDurationInWeeks() {
    return this.averagePlacementDuration / 7;
  }

  @keepLatestTask
  *calculateAveragePlacementDuration() {
    const invoices = yield this.store.query('invoice', {
      page: {
        number: 0,
        size: PAGE_SIZE.AVERAGE_NUMBER_REPORTS,
      },
      sort: '-invoice-date',
      include: 'case.order',
      'filter[case][delivery-method][:uri:]': DELIVERY_METHODS.TO_BE_INSTALLED,
      'filter[case][:has:order]': true,
    });

    const dayDiffs = yield Promise.all(
      invoices.toArray().map(async (invoice) => {
        const _case = await invoice.case;
        const order = await _case.order;
        return differenceInDays(invoice.invoiceDate, order.orderDate);
      })
    );

    this.averagePlacementDuration = median(dayDiffs);
  }

  @keepLatestTask
  *calculateAverageInterventionDuration() {
    const invoices = yield this.store.query('invoice', {
      page: {
        number: 0,
        size: PAGE_SIZE.AVERAGE_NUMBER_REPORTS,
      },
      sort: '-invoice-date',
      include: 'case.intervention',
      'filter[case][:has:intervention]': true,
    });

    const dayDiffs = yield Promise.all(
      invoices.toArray().map(async (invoice) => {
        const _case = await invoice.case;
        const intervention = await _case.intervention;
        return differenceInDays(invoice.invoiceDate, intervention.interventionDate);
      })
    );

    this.averageInterventionDuration = median(dayDiffs);
  }
}
