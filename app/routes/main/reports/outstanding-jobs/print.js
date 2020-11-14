import Route from '@ember/routing/route';
import OutstandingJob from '../../../../classes/outstanding-job';

export default class MainReportsOutstandingJobsPrintRoute extends Route {
  queryParams = {
    visitorName: { refreshModel: true },
    orderDate: { refreshModel: true }, // format yyyy-mm-dd
    hasProductionTicket: { refreshModel: true },
    mustBeInstalled: { refreshModel: true },
    mustBeDelivered: { refreshModel: true },
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

    if (params.orderDate)
      searchParams.append('filter[orderDate]', params.orderDate);

    searchParams.append('filter[hasProductionTicket]', params.hasProductionTicket);
    searchParams.append('filter[mustBeInstalled]', params.mustBeInstalled);
    searchParams.append('filter[mustBeDelivered]', params.mustBeDelivered);
    searchParams.append('filter[isProductReady]', params.isProductReady);

    endpoint.search = searchParams.toString();

    const response = await (await fetch(endpoint)).json();
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
