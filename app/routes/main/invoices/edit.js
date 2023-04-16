import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainInvoicesEditRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store.findRecord('invoice', params.invoice_id, {
      include: 'case',
    });
  }

  async afterModel(model) {
    const _case = await model.case;
    this.router.transitionTo('main.case.invoice.edit.index', _case.id, model.id);
  }
}
