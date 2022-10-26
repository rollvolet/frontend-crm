import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainOffersEditRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store.findRecord('offer', params.offer_id);
  }

  async afterModel(model) {
    // TODO get related case via offer model once relation is fully defined
    const _case = await this.store.queryOne('case', {
      'filter[:exact:offer]': model.uri,
    });
    this.router.transitionTo('main.case.offer.edit.index', _case.id, model.id);
  }
}
