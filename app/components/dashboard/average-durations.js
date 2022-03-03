import Component from '@glimmer/component';
import fetch, { Headers } from 'fetch';
import { keepLatestTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

const reportApiPath = '/api/reports/average-duration-report';

export default class DashboardOutstandingJobsComponent extends Component {
  @tracked averagePlacementDuration;
  @tracked averageInterventionDuration;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  get averagePlacementDurationInWeeks() {
    return this.averagePlacementDuration / 7;
  }

  @keepLatestTask
  *loadData() {
    const endpoint = new URL(reportApiPath, window.location.origin);

    const response = yield fetch(endpoint, {
      headers: new Headers({
        Accept: 'application/json',
      }),
    });
    const json = yield response.json();
    if (json.data) {
      const report = json.data.attributes;
      this.averagePlacementDuration = report['average-placement-duration'];
      this.averageInterventionDuration = report['average-intervention-duration'];
    }
  }
}
