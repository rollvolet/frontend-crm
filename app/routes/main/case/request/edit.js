import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainCaseRequestEditRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('request', params.request_id, {
      include: 'case.offer',
    });
  }
}
