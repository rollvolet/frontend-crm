import Controller from '@ember/controller';

export default Controller.extend({
  selectedTab: 0,
  actions: {
    goToRequestDetail(row) {
      const customer = this.get('model');
      const requestId = row.get('id');
      this.transitionToRoute('main.case.request.edit', customer, requestId);
    },
    goToNewRequest() {
      const customer = this.get('model');
      this.transitionToRoute('main.case.request.new', customer);
    },
    goToOfferDetail(row) {
      const customer = this.get('model');
      const offerId = row.get('id');
      this.transitionToRoute('main.case.offer', customer, offerId);
    },
    goToOrderDetail(row) {
      const customer = this.get('model');
      const orderId = row.get('id');
      this.transitionToRoute('main.case.order.index', customer, orderId);
    },
    goToDepositInvoiceDetail(row) {
      const customer = this.get('model');
      const orderId = row.get('order.id');
      this.transitionToRoute('main.case.order.deposit-invoices', customer, orderId);
    },
    goToInvoiceDetail(row) {
      const customer = this.get('model');
      const invoiceId = row.get('id');
      this.transitionToRoute('main.case.invoice', customer, invoiceId);
    },
    goToIndex() {
      this.transitionToRoute('main.customers.index');
    },
    openEdit() {
      this.set('isEdit', true);
    },
    closeEdit() {
      this.set('isEdit', false);
    }
  }
});
