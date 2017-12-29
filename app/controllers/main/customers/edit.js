import Controller from '@ember/controller';

export default Controller.extend({
  selectedTab: 0,
  actions: {
    goToRequestDetail(row) {
      const customer = this.get('model');
      const requestId = row.get('id');
      this.transitionToRoute('main.case.request', customer, requestId);
    }
  }
});
