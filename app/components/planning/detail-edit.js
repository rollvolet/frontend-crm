import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class PlanningDetailEditComponent extends Component {
  @action
  removePlanning() {
    this.args.model.planningDate = null;
    this.args.saveTask.perform();
  }
}
