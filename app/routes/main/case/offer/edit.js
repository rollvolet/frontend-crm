import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MainCaseOfferEditRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('offer', params.offer_id, {
      include: 'case.request.visit,case.order',
    });
  }
}
