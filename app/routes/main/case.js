import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MainCaseRoute extends Route {
  @service store;
  @service router;

  async beforeModel(transition) {
    const caseId = this.paramsFor('main.case').case_id;
    if (`${caseId}`.length < 10) {
      // it's a legacy SQL ID instead of a UUID
      const type = transition.to.name.split('.')[2]; // request, order or intervention
      const id = this.paramsFor(`main.case.${type}.edit`)[`${type}_id`];
      this.router.transitionTo('main.legacy-case', caseId, {
        queryParams: {
          type,
          id,
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
        'invoice',
        'invalidation',
        'vat-rate',
      ].join(','),
    });
  }
}
