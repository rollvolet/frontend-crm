import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainCaseRoute extends Route {
  @service store;

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
      ].join(','),
    });
  }
}
