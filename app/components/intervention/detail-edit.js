import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class InterventionDetailEditComponent extends Component {
  @action
  setTechnicians(employees) {
    this.args.model.technicians = employees;
  }
}
