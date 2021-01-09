import Route from '@ember/routing/route';
import fetch from 'fetch';
import { inject as service } from '@ember/service';
import MonthlySalesEntry from '../../../classes/monthly-sales-entry';

export default class MainReportsRevenueRoute extends Route {
  @service userInfo

  queryParams = {
    fromYear: {
      refreshModel: true
    },
    toYear: {
      refreshModel: true
    }
  };

  beforeModel() {
    if (!this.userInfo.hasBoardRole)
      this.transitionTo('forbidden');
  }

  async model(params) {
    const endpoint = new URL(`/api/reports/revenue`, window.location.origin);
    const urlParams = new URLSearchParams(Object.entries({
      fromYear: params.fromYear,
      toYear: params.toYear
    }));

    endpoint.search = urlParams.toString();
    const response = await (await fetch(endpoint)).json();
    return response.data.map(item => new MonthlySalesEntry(item.attributes));
  }
}
