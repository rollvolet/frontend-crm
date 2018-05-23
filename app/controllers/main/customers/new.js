import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    goToShow() {
      this.transitionToRoute('main.customers.edit', this.model);
    },
    goToIndex() {
      this.transitionToRoute('main.customers.index');
    }
  }
});
