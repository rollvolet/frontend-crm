import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get('store').findRecord('offer', params.offer_id, {
      include: 'building,contact,vat-rate,submission-type,product,request'
    });
  },
  afterModel(model) {
    const controller = this.controllerFor('main.case');
    controller.set('building', model.get('building'));
    controller.set('contact', model.get('contact'));
    controller.set('requestId', model.get('request.id'));
    controller.set('offerId', model.get('id'));
  }
});
