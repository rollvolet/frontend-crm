import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default class InvoiceRoute extends Route {
  @service case;
  @service store;

  async model() {
    const intervention = this.modelFor('main.case.intervention.edit');
    const vatRate = this.store.peekAll('vat-rate').find((v) => v.rate == 6);
    const customer = this.modelFor('main.case');
    const contact = await intervention.contact;
    const building = await intervention.building;

    const invoiceDate = new Date();
    const dueDate = moment(invoiceDate).add(14, 'days').toDate();

    const invoice = this.store.createRecord('invoice', {
      invoiceDate,
      dueDate,
      certificateRequired: vatRate.rate == 6,
      certificateReceived: false,
      certificateClosed: false,
      isCreditNote: false,
      hasProductionTicket: false,
      comment: intervention.comment,
      intervention,
      customer,
      contact,
      building,
      vatRate,
    });

    return invoice.save();
  }

  afterModel(model) {
    // update case to display the new invoice tab
    this.case.updateRecord('invoice', model);

    const customer = this.modelFor('main.case');
    this.transitionTo('main.case.invoice.edit', customer, model);
  }
}
