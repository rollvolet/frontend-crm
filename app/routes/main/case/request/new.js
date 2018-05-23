import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    const customer = this.modelFor('main.case');
    const request = this.store.createRecord('request', {
      requestDate: new Date(),
      requiresVisit: false,
      customer: customer
    });

    return request.save();
  },
  afterModel(model) {
    const customer = this.modelFor('main.case');
    this.transitionTo('main.case.request.edit', customer, model, {
      queryParams: { editMode: true }
    });
  }
});
