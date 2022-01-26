import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default class NewRoute extends Route {
  @service store;
  @service router;

  async model() {
    const customer = this.modelFor('main.case');
    const vatRate = this.store.peekAll('vat-rate').find((v) => v.rate == 21);

    const invoiceDate = new Date();
    const dueDate = moment(invoiceDate).add(14, 'days').toDate();

    const invoice = this.store.createRecord('invoice', {
      invoiceDate,
      dueDate,
      isCreditNote: false,
      hasProductionTicket: false,
      customer,
      vatRate,
    });

    return invoice.save();
  }

  afterModel(model) {
    const customer = this.modelFor('main.case');
    this.router.transitionTo('main.case.invoice.edit', customer, model);
  }
}
