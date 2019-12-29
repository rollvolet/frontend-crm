import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';

@classic
export default class EditRoute extends Route {
  model(params) {
    return this.store.findRecord('offer', params.offer_id, {
      include: 'building,contact,vat-rate'
    });
  }

  afterModel(model) {
    const controller = this.controllerFor('main.case');
    controller.set('building', model.get('building'));
    controller.set('contact', model.get('contact'));
  }
}
