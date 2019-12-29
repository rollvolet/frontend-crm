import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';

@classic
export default class CaseRoute extends Route {
  model(params) {
    return this.store.findRecord('customer', params.customer_id, {
      // telephones are not included but retrieved through a separate request
      // because telephone types need to be included
      include: 'honorific-prefix'
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('memoExpanded', false);
    controller.set('isEnabledEditBuilding', false);
    controller.set('isEnabledEditContact', false);
  }
}
