import Route from '@ember/routing/route';
import fetch, { Headers } from 'fetch';
import { inject as service } from '@ember/service';
import MonthlySalesEntry from '../../../classes/monthly-sales-entry';

export default class MainReportsRevenueRoute extends Route {
  @service session
  @service currentSession

  queryParams = {
    fromYear: {
      refreshModel: true
    },
    toYear: {
      refreshModel: true
    }
  };

  beforeModel() {
    if (!this.currentSession.hasBoardRole)
      this.transitionTo('forbidden');
  }

  async model(params) {
    const endpoint = new URL(`/api/reports/revenue`, window.location.origin);
    const urlParams = new URLSearchParams(Object.entries({
      fromYear: params.fromYear,
      toYear: params.toYear
    }));

    endpoint.search = urlParams.toString();
    const { access_token } = this.session.data.authenticated;
    const response = await (await fetch(endpoint, {
      headers: new Headers({
        Authorization: `Bearer ${access_token}`
      })
    })).json();
    return response.data.map(item => new MonthlySalesEntry(item.attributes));
  }
}
