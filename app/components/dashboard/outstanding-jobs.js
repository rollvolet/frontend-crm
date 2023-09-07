import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { keepLatestTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import constants from '../../config/constants';

const { CASE_STATUSES } = constants;

export default class DashboardOutstandingJobsComponent extends Component {
  @service store;

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
      this.orders = yield this.store.query('order', {
        page: {
          size: this.size,
          number: this.page,
        },
        sort: this.sort,
        include: 'case.customer.address,case.building.address',
        filter: {
          case: {
            request: {
              visitor: {
                ':uri:': this.args.employee.uri,
              },
            },
            ':has-no:invoice': true,
            status: CASE_STATUSES.ONGOING,
          },
        },
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
