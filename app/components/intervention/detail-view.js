import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency-decorators';

export default class InterventionDetailViewComponent extends Component {
  @tracked planningEvent

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.planningEvent = yield this.args.model.planningEvent;
  }

  get technicianNames() {
    return this.args.model.technicians
      .sortBy('firstName')
      .mapBy('firstName');
  }

  get isNbOfPersonsWarning() {
    return this.args.model.nbOfPersons == 2;
  }
}
