import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import subYears from 'date-fns/subYears';
import formatISO from 'date-fns/formatISO';
import constants from '../../config/constants';

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

      this.orders = yield this.store.query('order', {
        page: {
          size: this.size,
          number: this.page,
        },
        sort: this.sort,
        include: 'case.customer,case.building',
        filter: {
          ':gt:order-date': formatISO(yearAgo, { representation: 'date' }),
          case: {
            request: {
              visitor: {
                ':uri:': this.args.employee.uri,
              },
            },
            ':has-no:invoice': true,
            status: CASE_STATUSES.ONGOING,
            'has-production-ticket': false,
          },
        },
      });
    }
  }

  @action
  navigateToDetail(order) {
    this.router.transitionTo('main.orders.edit', order.id);
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
