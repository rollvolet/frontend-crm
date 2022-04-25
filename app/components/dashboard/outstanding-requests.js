import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class DashboardOutstandingRequestsComponent extends Component {
  @service store;
  @service router;

  @tracked size = 25;
  @tracked page = 0;
  @tracked sort = '-request-date';
  @tracked showFutureVisits = false;
  @tracked requests = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    if (this.args.employee) {
      const yearAgo = new Date();
      yearAgo.setYear(yearAgo.getFullYear() - 1);

      const filter = {
        visitor: this.args.employee.firstName,
        hasOffer: 0,
        isCancelled: 0,
        ':gt:request-date': yearAgo.toISOString(),
      };

      if (this.showFutureVisits) {
        const now = new Date();
        filter[':lte:visit-date'] = now.toISOString();
      }

      this.requests = yield this.store.query('request', {
        include: 'customer,customer.honorific-prefix,building',
        page: {
          size: this.size,
          number: this.page,
        },
        sort: this.sort,
        filter,
      });
    }
  }

  @action
  toggleShowFutureVisits(value) {
    this.showFutureVisits = value;
    this.loadData.perform();
  }

  @action
  async navigateToDetail(request) {
    const customer = await request.customer;
    if (customer) {
      this.router.transitionTo('main.case.request.edit', customer.id, request.id);
    } else {
      this.router.transitionTo('main.requests.edit', request.id);
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
