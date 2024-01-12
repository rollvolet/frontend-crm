import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { keepLatestTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import subYears from 'date-fns/subYears';
import formatISO from 'date-fns/formatISO';
import search from '../../utils/mu-search';
import constants from '../../config/constants';

const { CASE_STATUSES } = constants;

export default class DashboardOutstandingJobsComponent extends Component {
  @service store;

  @tracked size = 25;
  @tracked page = 0;
  @tracked sort = 'order-date';
  @tracked orders = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    if (this.args.employee) {
      const yearAgo = subYears(new Date(), 1);
      const orderDate = formatISO(yearAgo, { representation: 'date' });

      this.orders = yield search('orders', this.page, this.size, this.sort, {
        ':gt:orderDate': orderDate,
        'case.status': CASE_STATUSES.ONGOING,
        ':has-no:invoiceId': 't',
        visitorName: this.args.employee.firstName,
      });
    }
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
