import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['editMode'],
  editMode: false,
  actions: {
    goToCustomer(customer) {
      this.transitionToRoute('main.customers.edit', customer);
    }
  }
});
