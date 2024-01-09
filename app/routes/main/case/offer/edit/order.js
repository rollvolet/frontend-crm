import Route from '@ember/routing/route';
import { debug } from '@ember/debug';
import { service } from '@ember/service';

export default class MainCaseOfferEditOrderRoute extends Route {
  @service store;
  @service router;

  async beforeModel() {
    const offer = this.modelFor('main.case.offer.edit');
    const _case = this.modelFor('main.case');
    const order = await _case.order;
    if (order) {
      debug(`Order already exists for offer ${offer.id}. Transition directly to order edit route.`);
      this.router.transitionTo('main.case.order.edit', _case.id, order.id);
    }
  }

  async model() {
    const offer = this.modelFor('main.case.offer.edit');
    const _case = this.modelFor('main.case');
    const offerlines = await this.store.query('offerline', {
      'filter[offer][:uri:]': offer.uri,
      sort: 'position',
      page: { size: 100 },
    });

    return {
      case: _case,
      offer,
      offerlines,
    };
  }

  resetController(controller) {
    const offerlines = controller.model.offerlines;
    offerlines.forEach((line) => (line.isOrdered = false));
  }
}
