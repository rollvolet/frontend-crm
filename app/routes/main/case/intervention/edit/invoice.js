import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default class MainCaseInterventionEditInvoiceRoute extends Route {
  @service case;
  @service store;
  @service router;

  async model() {
    const intervention = this.modelFor('main.case.intervention.edit');
    const vatRate = this.store.peekAll('vat-rate').find((v) => v.rate == 6);
    const customer = await intervention.customer;
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

    await invoice.save();

    // TODO set case on creation of invoice once relation is fully defined
    await this.case.current.updateRecord('invoice', invoice);

    return invoice;
  }

  afterModel(model) {
    const _case = this.modelFor('main.case');
    this.router.transitionTo('main.case.invoice.edit', _case, model);
  }
}
