import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    const customer = this.modelFor('main.case');
    const request = this.modelFor('main.case.request.edit');
    const offer = this.store.createRecord('offer', {
      offerDate: new Date(),
      customer: customer,
      request: request
      // TODO add contact/building from request?
    });

    return offer.save();
  },
  afterModel(model) {
    const customer = this.modelFor('main.case');
    this.transitionTo('main.case.offer.edit', customer, model, {
      queryParams: { editMode: true }
    });

    // update case to display the new offer tab
    const controller = this.controllerFor('main.case');
    controller.set('case.offerId', model.get('id'));
  }
});
