import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MainCaseRoute extends Route {
  @service store;
  @service router;

  async beforeModel(transition) {
    let routeInfo = transition.to;
    let caseId,
      type,
      recordId = null;

    while (routeInfo) {
      const params = routeInfo.params;
      if (params.case_id) {
        caseId = params.case_id;
      }
      for (let key of ['request', 'order', 'intervention']) {
        if (params[`${key}_id`]) {
          type = key;
          recordId = params[`${key}_id`];
        }
      }

      routeInfo = routeInfo.parent;
    }

    if (caseId && `${caseId}`.length < 10) {
      // it's a legacy SQL ID instead of a UUID
      this.router.transitionTo('main.legacy-case', caseId, {
        queryParams: {
          type,
          id: recordId,
        },
      });
    } // else: just continue the regular flow
  }

  model(params) {
    return this.store.findRecord('case', params.case_id, {
      include: [
        'customer',
        'contact',
        'building',
        'request.visitor',
        'intervention',
        'offer',
        'order',
        'deposit-invoices',
        'invoice',
        'invalidation',
        'vat-rate',
      ].join(','),
    });
  }
}
