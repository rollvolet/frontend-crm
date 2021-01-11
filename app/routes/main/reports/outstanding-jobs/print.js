import Route from '@ember/routing/route';
import OutstandingJob from '../../../../classes/outstanding-job';
import fetch, { Headers } from 'fetch';

export default class MainReportsOutstandingJobsPrintRoute extends Route {
  queryParams = {
    visitorName: { refreshModel: true },
    orderDate: { refreshModel: true }, // format yyyy-mm-dd
    hasProductionTicket: { refreshModel: true },
    execution: { refreshModel: true },
    isProductReady: { refreshModel: true },
  }

  async model(params) {
    const endpoint = new URL(`/api/reports/outstanding-jobs`, window.location.origin);
    const searchParams = new URLSearchParams(Object.entries({
      'page[size]': 5000, // for printing we need all entries
      'page[number]': 0
    }));

    if (params.visitorName)
      searchParams.append('filter[visitor]', params.visitorName);

    if (params.execution == 'delivery') {
      searchParams.append('filter[mustBeDelivered]', 1);
      searchParams.append('filter[mustBeInstalled]', 0);
    } else if (params.execution == 'installation') {
      searchParams.append('filter[mustBeDelivered]', 0);
      searchParams.append('filter[mustBeInstalled]', 1);
    } else if (params.execution == 'take-out') {
      searchParams.append('filter[mustBeDelivered]', 0);
      searchParams.append('filter[mustBeInstalled]', 0);
    } else {
      searchParams.append('filter[mustBeDelivered]', -1);
      searchParams.append('filter[mustBeInstalled]', -1);
    }

    if (params.orderDate)
      searchParams.append('filter[orderDate]', params.orderDate);

    searchParams.append('filter[hasProductionTicket]', params.hasProductionTicket);
    searchParams.append('filter[isProductReady]', params.isProductReady);

    endpoint.search = searchParams.toString();

    const response = await (await fetch(endpoint), {
      headers: new Headers({
        Accept: 'application/json'
      })
    }).json();
    const entries = response.data.map(item => new OutstandingJob(item.attributes));

    return entries;
  }

  async afterModel(model) {
    let visitors = this.store.peekAll('employee');
    if (!visitors.length)
      visitors = await this.store.findAll('employee');
    model.forEach((row) => {
      const visitor = visitors.find(e => e.firstName == row.visitor);
      row.visitorInitials = visitor && visitor.initials;
    });
  }

}
