import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainCaseRoute extends Route {
  @service store;
  @service case;

  beforeModel() {
    return this.case.unloadCase();
  }

  model(params) {
    return this.store.findRecord('case', params.case_id);
  }

  afterModel(model) {
    return this.case.loadCase.perform(model);
  }
}
