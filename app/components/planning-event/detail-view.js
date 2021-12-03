import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class PlanningEventDetailViewComponent extends Component {
  @service case;

  constructor() {
    super(...arguments);
    this.case.on('updateBuilding:succeeded', this, this.handleBuildingUpdatedEvent);
  }

  willDestroy() {
    this.case.off('updateBuilding:succeeded', this, this.handleBuildingUpdatedEvent);
    super.willDestroy(...arguments);
  }

  handleBuildingUpdatedEvent() {
    this.args.model.reload();
  }

  @task
  *forceUpdate() {
    yield this.args.model.save();
    this.editMode = false;
  }
}
