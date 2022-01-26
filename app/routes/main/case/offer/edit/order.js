import Route from '@ember/routing/route';
import { debug } from '@ember/debug';
import { inject as service } from '@ember/service';

export default class OrderRoute extends Route {
  @service store;
  @service router;

  async beforeModel() {
    const offer = this.modelFor('main.case.offer.edit');
    const order = await offer.order;
    if (order) {
      const customer = this.modelFor('main.case');
      debug(`Order already exists for offer ${offer.id}. Transition directly to order edit route.`);
      this.router.transitionTo('main.case.order.edit', customer, order);
    }
  }

  model() {
    const offer = this.modelFor('main.case.offer.edit');
    // TODO use offer.offerlines once the relation is defined
    return this.store.query('offerline', {
      'filter[offer]': offer.url,
      sort: 'sequence-number',
      page: { size: 100 },
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    const offer = this.modelFor('main.case.offer.edit');
    controller.set('offer', offer);
  }

  resetController(controller) {
    const offerlines = controller.model;
    offerlines.forEach((line) => (line.isOrdered = false));
  }
}
