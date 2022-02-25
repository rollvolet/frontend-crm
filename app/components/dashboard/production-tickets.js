import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

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
    this.orders = yield this.store.query('order', {
      include: 'customer,customer.honorific-prefix,building',
      page: {
        size: this.size,
        number: this.page,
      },
      sort: this.sort,
      filter: {
        offer: {
          request: {
            visitor: this.args.employee?.firstName,
          },
        },
        hasProductionTicket: 0,
        isCancelled: 0,
      },
    });
  }

  @action
  async navigateToDetail(order) {
    const customer = await order.customer;
    this.router.transitionTo('main.case.order.edit', customer.id, order.id);
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
