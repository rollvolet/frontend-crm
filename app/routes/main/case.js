import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CaseRoute extends Route {
  @service store;
  @service case;

  model(params) {
    return this.store.findRecord('case', params.case_id);
  }

  afterModel(model) {
    return this.case.loadCase.perform(model);
  }

  @action
  willTransition() {
    this.case.unloadCase();
  }
}
