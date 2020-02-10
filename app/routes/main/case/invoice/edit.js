import Route from '@ember/routing/route';

export default class EditRoute extends Route {
  model(params) {
    return this.store.loadRecord('invoice', params.invoice_id, {
      include: 'vat-rate'
    });
  }
}
