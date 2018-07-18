import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  case: service(),

  async model() {
    const customer = this.modelFor('main.case');
    const request = this.modelFor('main.case.request.edit');
    const contact = await request.get('contact');
    const building = await request.get('building');
    const offer = this.store.createRecord('offer', {
      offerDate: new Date(),
      customer,
      request,
      contact,
      building
    });

    return offer.save();
  },
  afterModel(model) {
    const customer = this.modelFor('main.case');
    this.transitionTo('main.case.offer.edit', customer, model, {
      queryParams: { editMode: true }
    });

    // update case to display the new offer tab
    this.case.set('current.offerId', model.get('id'));
  }
});
