import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { or, notEmpty } from 'ember-awesome-macros';

export default Controller.extend({
  store: service(),

  hasInvoice: notEmpty('order.invoice.id'),
  isDisabledEdit: or('order.isMasteredByAccess', 'hasInvoice'),

  actions: {
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

      this.model.pushObject(depositInvoice);
      const { validations } = await depositInvoice.validate();
      if (validations.isValid)
        return depositInvoice.save();
      else
        return depositInvoice;
    }
  }
});
