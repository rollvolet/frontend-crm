import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import subYears from 'date-fns/subYears';
import formatISO from 'date-fns/formatISO';
import constants from '../../config/constants';
import search from '../../utils/mu-search';

const { CASE_STATUSES } = constants;

export default class DashboardProductionTicketsComponent extends Component {
  @service store;
  @service router;

  @tracked size = 25;
  @tracked page = 0;
  @tracked sort = '-order-date';
  @tracked orders = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    if (this.args.employee) {
      const yearAgo = subYears(new Date(), 1);

      this.orders = yield search('orders', this.page, this.size, this.sort, {
        ':gt:orderDate': formatISO(yearAgo, { representation: 'date' }),
        visitorName: this.args.employee.firstName,
        ':has-no:invoiceId': 't',
        'case.status': CASE_STATUSES.ONGOING,
        hasProductionTicket: false,
      });
    }
  }

  @action
  navigateToDetail(order) {
    this.router.transitionTo('main.case.order.edit.index', order.case.uuid, order.uuid);
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
    this.loadData.perform();
  }
}
