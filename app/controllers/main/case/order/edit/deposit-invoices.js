import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  store: service(),

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

      const depositInvoice = this.store.createRecord('deposit-invoice', {
        invoiceDate: new Date(),
        baseAmount: 0,
        certificateRequired: vatRate.code == 6,
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
