import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default class DepositInvoicesController extends Controller {
  @service store
  @service case

  get customer() {
    return this.case.current && this.case.current.customer;
  }

  get order() {
    return this.case.current && this.case.current.order;
  }

  get invoice() {
    return this.case.current && this.case.current.invoice;
  }

  get isDisabledEdit() {
    return this.order.isMasteredByAccess || this.invoice;
  }

  @action
  async createNewDepositInvoice() {
    const offer = await this.order.offer;
    const customer = this.customer;
    const contact = await this.order.contact;
    const building = await this.order.building;
    const vatRate = await this.order.vatRate;

    const invoiceDate = new Date();
    const dueDate = moment(invoiceDate).add(14, 'days').toDate();

    const depositInvoice = this.store.createRecord('deposit-invoice', {
      invoiceDate,
      dueDate,
      certificateRequired: vatRate.rate == 6,
      certificateReceived: false,
      certificateClosed: false,
      reference: offer.reference,
      order: this.order,
      vatRate,
      customer,
      contact,
      building
    });

    const { validations } = await depositInvoice.validate();
    if (validations.isValid)
      return depositInvoice.save();
    else
      return depositInvoice;
  }

  @action
  updateList() {
    this.send('refreshModel');
  }
}
