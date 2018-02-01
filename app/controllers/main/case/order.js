import Controller from '@ember/controller';

export default Controller.extend({
  showDeposits: false,
  actions: {
    sum(a, b) {
      return a + b;
    },
    toggleShowDeposits() {
      this.toggleProperty('showDeposits');
    }
  }
});
