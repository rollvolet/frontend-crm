import Component from '@glimmer/component';
import { service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import addDays from 'date-fns/addDays';
import subYears from 'date-fns/subYears';
import formatISO from 'date-fns/formatISO';
import constants from '../../config/constants';
import search from '../../utils/mu-search';

const { CASE_STATUSES } = constants;

export default class DashboardOutstandingRequestsComponent extends Component {
  @service store;
  @service router;

  @tracked size = 25;
  @tracked page = 0;
  @tracked sort = '-number';
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
        ':gt:requestDate': formatISO(yearAgo, { representation: 'date' }),
        visitorName: this.args.employee.firstName,
        ':has-no:offerId': 't',
        'case.status': CASE_STATUSES.ONGOING,
      };

      if (!this.showFutureVisits) {
        const tomorrow = formatISO(addDays(new Date(), 1), { representation: 'date' });
        filter[
          ':query:plannedDate'
        ] = `(plannedDate:{* TO ${tomorrow}}) OR (NOT _exists_:plannedDate)`;
      }

      this.requests = yield search('requests', this.page, this.size, this.sort, filter);
    }
  }

  @action
  toggleShowFutureVisits(value) {
    this.showFutureVisits = value;
    this.loadData.perform();
  }

  @action
  navigateToDetail(request) {
    this.router.transitionTo('main.case.request.edit.index', request.case.uuid, request.uuid);
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
