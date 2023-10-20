import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import subYears from 'date-fns/subYears';
import formatISO from 'date-fns/formatISO';
import constants from '../../config/constants';

const { CASE_STATUSES } = constants;

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
      const yearAgo = subYears(new Date(), 1);

      const filter = {
        ':gt:request-date': formatISO(yearAgo, { representation: 'date' }),
        visitor: {
          ':uri:': this.args.employee.uri,
        },
        case: {
          ':has-no:offer': true,
          status: CASE_STATUSES.ONGOING,
        },
      };

      if (!this.showFutureVisits) {
        filter[':or:'] = {
          visit: {
            ':lte:date': formatISO(new Date(), { representation: 'date' }),
          },
          ':has-no:visit': true,
        };
      }

      this.requests = yield this.store.query('request', {
        page: {
          size: this.size,
          number: this.page,
        },
        sort: this.sort,
        include: 'case.customer,case.building',
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
  async navigateToDetail(request, event) {
    if (event.srcElement.attributes['type']?.value != 'checkbox') {
      this.router.transitionTo('main.requests.edit', request.id);
    }
    // else: checkbox on row has been clicked. Prevent transition to other route
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
