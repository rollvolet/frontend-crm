import Route from '@ember/routing/route';
import fetch, { Headers } from 'fetch';
import { inject as service } from '@ember/service';
import MonthlySalesEntry from '../../../classes/monthly-sales-entry';

export default class MainReportsRevenueRoute extends Route {
  @service userInfo;
  @service router;

  queryParams = {
    fromYear: {
      refreshModel: true,
    },
    toYear: {
      refreshModel: true,
    },
  };

  beforeModel() {
    if (!this.userInfo.isBoard) {
      this.router.transitionTo('forbidden');
    }
  }

  async model(params) {
    const endpoint = new URL(`/api/reports/revenue`, window.location.origin);
    const urlParams = new URLSearchParams(
      Object.entries({
        fromYear: params.fromYear,
        toYear: params.toYear,
      })
    );

    endpoint.search = urlParams.toString();
    const response = await fetch(endpoint, {
      headers: new Headers({
        Accept: 'application/json',
      }),
    });
    const json = await response.json();
    return json.data.map((item) => new MonthlySalesEntry(item.attributes));
  }
}
