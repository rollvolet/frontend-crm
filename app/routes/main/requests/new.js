import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    const request = this.store.createRecord('request', {
      requestDate: new Date(),
      requiresVisit: false
    });

    return request.save();
  },
  afterModel(model) {
    this.transitionTo('main.requests.edit', model, {
      queryParams: { editMode: true }
    });
  }
});
