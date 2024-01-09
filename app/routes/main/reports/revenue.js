import Route from '@ember/routing/route';
import fetch, { Headers } from 'fetch';
import { service } from '@ember/service';
import MonthlySalesEntry from '../../../classes/monthly-sales-entry';

export default class MainReportsRevenueRoute extends Route {
  @service userInfo;
  @service router;

  queryParams = {
    fromYear: {
      refreshModel: true,
    },
    untilYear: {
      refreshModel: true,
    },
  };

  beforeModel() {
    if (!this.userInfo.isBoard) {
      this.router.transitionTo('forbidden');
    }
  }

  async model(params) {
    const response = await fetch('/revenue-reports', {
      method: 'POST',
      headers: new Headers({
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      }),
      body: JSON.stringify({
        data: {
          type: 'revenue-reports',
          attributes: {
            'from-year': params.fromYear,
            'until-year': params.untilYear,
          },
        },
      }),
    });
    const json = await response.json();
    return json.data.map((item) => new MonthlySalesEntry(item.attributes));
  }
}
