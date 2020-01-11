import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';
import { debug } from '@ember/debug';

@classic
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
    return this.modelFor('main.case.offer.edit');
  }
}
