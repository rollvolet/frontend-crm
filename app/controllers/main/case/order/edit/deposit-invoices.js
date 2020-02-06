import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';

export default class DepositInvoicesController extends Controller {
  @service store
  @service case

  @tracked customer
  @tracked order

  get hasInvoice() {
    return this.case.invoice != null;
  }

  get isDisabledEdit() {
    return this.order.isMasteredByAccess || this.hasInvoice;
  }

  @action
  async createNewDeposit() {
    const deposit = this.store.createRecord('deposit', {
      customer: this.customer,
      order: this.order,
      paymentDate: new Date()
    });
    this.order.deposits.pushObject(deposit);
    const { validations } = await deposit.validate();
    if (validations.isValid)
      return deposit.save();
    else
      return deposit;
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
