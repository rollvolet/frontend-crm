import Route from '@ember/routing/route';
import { debug } from '@ember/debug';

export default class OrderRoute extends Route {
  async beforeModel() {
    const offer = this.modelFor('main.case.offer.edit');
    const order = await offer.order;
    if (order) {
      const customer = this.modelFor('main.case');
      debug(`Order already exists for offer ${offer.id}. Transition directly to order edit route.`);
      this.transitionTo('main.case.order.edit', customer, order);
    }
  }

  model() {
    const offer = this.modelFor('main.case.offer.edit');
    return offer.offerlines;
  }

  setupController(controller) {
    super.setupController(...arguments);
    const offer = this.modelFor('main.case.offer.edit');
    controller.set('offer', offer);
  }

  resetController(controller) {
    const offerlines = controller.model;
    offerlines.forEach(line => line.isOrdered = false);
  }
}
