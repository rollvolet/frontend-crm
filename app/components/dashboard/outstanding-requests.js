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
  @service documentGeneration;

  @tracked size = 25;
  @tracked page = 0;
  @tracked sort = '-request-date';
  @tracked showFutureVisits = false;

  @tracked requests = [];
  @tracked selectedRequests = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  get isSelectedAll() {
    if (this.requests.length) {
      const requestIds = this.requests.sortBy('id').mapBy('id');
      const selectedRequestIds = this.selectedRequests.sortBy('id').mapBy('id');
      return requestIds == selectedRequestIds;
    } else {
      return false;
    }
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
    if (!this.showFutureVisits) {
      // Future requests are removed from list, hence selection might be outdated.
      // Just reset selection to prevent landing in an inconsistent state.
      this.selectedRequests = [];
    }
  }

  @action
  toggleSelection(request, checked) {
    if (checked) {
      this.selectedRequests.addObject(request);
    } else {
      this.selectedRequests.removeObject(request);
    }
  }

  @action
  toggleSelectionAll(checked) {
    if (checked) {
      this.selectedRequests = this.requests.slice(0);
    } else {
      this.selectedRequests = [];
    }
  }

  @action
  printVisitReport() {
    const requestIds = this.selectedRequests.sortBy('id').mapBy('id');
    this.documentGeneration.downloadVisitSummary(requestIds);
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
