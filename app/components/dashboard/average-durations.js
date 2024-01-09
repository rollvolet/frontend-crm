import Component from '@glimmer/component';
import { service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import differenceInDays from 'date-fns/differenceInDays';
import config from '../../config';
import constants from '../../config/constants';
import search from '../../utils/mu-search';
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
    const orders = yield search('orders', 0, PAGE_SIZE.AVERAGE_NUMBER_REPORTS, '-invoice-date', {
      deliveryMethodUri: DELIVERY_METHODS.TO_BE_INSTALLED,
      ':has:invoiceId': 't',
    });

    const dayDiffs = orders.toArray().map((order) => {
      const invoiceDate = new Date(Date.parse(order.invoiceDate));
      const orderDate = new Date(Date.parse(order.orderDate));
      return differenceInDays(invoiceDate, orderDate);
    });

    this.averagePlacementDuration = median(dayDiffs);
  }

  @keepLatestTask
  *calculateAverageInterventionDuration() {
    const interventions = yield search(
      'interventions',
      0,
      PAGE_SIZE.AVERAGE_NUMBER_REPORTS,
      '-invoice-date',
      {
        ':has:invoiceId': 't',
      }
    );

    const dayDiffs = interventions.toArray().map((intervention) => {
      const invoiceDate = new Date(Date.parse(intervention.invoiceDate));
      const interventionDate = new Date(Date.parse(intervention.interventionDate));
      return differenceInDays(invoiceDate, interventionDate);
    });

    this.averageInterventionDuration = median(dayDiffs);
  }
}
