import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainOffersEditRoute extends Route {
  @service store;
  @service router;

  model(params) {
    this.offerId = params.offer_id;
    return this.store.queryOne('case', {
      'filter[offer][:id:]': params.offer_id,
    });
  }

  afterModel(model) {
    this.router.transitionTo('main.case.offer.edit.index', model.id, this.offerId);
  }
}
