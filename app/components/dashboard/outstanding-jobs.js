import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { fetchOutstandingJobs } from '../../utils/fetch-outstanding-jobs';

export default class DashboardOutstandingJobsComponent extends Component {
  @service userInfo;

  @tracked size = 25;
  @tracked page = 0;
  @tracked sort = '-order-date';
  @tracked outstandingJobs = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    const employee = yield this.userInfo.getEmployee();
    const searchParams = new URLSearchParams(
      Object.entries({
        'page[size]': this.size,
        'page[number]': this.page,
        sort: this.sort,
        'filter[visitor]': employee?.firstName,
        'filter[mustBeDelivered]': -1,
        'filter[mustBeInstalled]': -1,
      })
    );

    this.outstandingJobs = yield fetchOutstandingJobs(searchParams);
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
