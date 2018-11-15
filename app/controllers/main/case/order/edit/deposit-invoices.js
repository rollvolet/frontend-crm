import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { notEmpty } from '@ember/object/computed';

export default Controller.extend({
  store: service(),

  isDisabledEdit: notEmpty('order.invoice.id'),

  actions: {
    async createNewDeposit() {
      const deposit = this.store.createRecord('deposit', {
        customer: this.customer,
        order: this.order,
        paymentDate: new Date(),
        amount: 0
      });
      this.order.deposits.pushObject(deposit);
      return deposit.save();
    },
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
        baseAmount: 0,
        certificateRequired: vatRate.rate == 6,
        certificateReceived: false,
        certificateClosed: false,
        isCreditNote: false,
        hasProductionTicket: false,
        reference: offer.reference,
        order: this.order,
        vatRate,
        customer,
        contact,
        building
      });

      this.model.pushObject(depositInvoice);
      await depositInvoice.save();
      return depositInvoice;
    }
  }
});
