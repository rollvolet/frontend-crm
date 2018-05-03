import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    onRollback() {
      this.transitionToRoute('main.customers.index');
    },
    onSave(customer) {
      this.transitionToRoute('main.customers.edit', customer.id);
    }
  }
});
