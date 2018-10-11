import Route from '@ember/routing/route';

export default Route.extend({
  async model() {
    const customer = this.modelFor('main.case');
    const vatRate = this.store.peekAll('vat-rate').find(v => v.rate == 21);
    const invoice = this.store.createRecord('invoice', {
      invoiceDate: new Date(),
      isPaidInCash: false,
      certificateRequired: false,
      certificateReceived: false,
      certificateClosed: false,
      isCreditNote: false,
      hasProductionTicket: false,
      customer,
      vatRate
    });

    return invoice.save();
  },
  afterModel(model) {
    const customer = this.modelFor('main.case');
    this.transitionTo('main.case.invoice.edit', customer, model);
  }
});
