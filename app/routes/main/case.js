import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get('store').findRecord('customer', params.customer_id, {
      // telephones are not included but retrieved through a separate request
      // because telephone types need to be included
      include: 'language,country,honorific-prefix'
    });
  },
  actions: {
    setContact(contact) {
      const controller = this.controllerFor('main.case');
      controller.set('contact', contact);
    },
    setBuilding(building) {
      const controller = this.controllerFor('main.case');
      controller.set('building', building);
    }
  }
});
