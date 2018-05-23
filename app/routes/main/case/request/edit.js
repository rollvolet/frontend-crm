import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get('store').findRecord('request', params.request_id, {
      include: 'way-of-entry,building,contact,visit,offer'
    });
  },
  afterModel(model) {
    const controller = this.controllerFor('main.case');
    controller.set('building', model.get('building'));
    controller.set('contact', model.get('contact'));
  },
  setupController(controller, model) {
    this._super(controller, model);

    if (model.employee) {
      const employee = this.store.peekAll('employee').find(e => e.firstName == model.employee);
      controller.set('employee', employee);
    }
  }
});
