import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrderDetailEditComponent extends Component {
  @service case

  get request() {
    return this.case.current && this.case.current.request;
  }

  get offer() {
    return this.case.current && this.case.current.offer;
  }

  get visitor() {
    return this.case.visitor;
  }

  @action
  setCanceled(value) {
    this.args.model.canceled = value;

    if (!value)
      this.args.model.cancellationReason = null;
  }

  @action
  setExecution(execution) {
    this.args.model.mustBeInstalled = false;
    this.args.model.mustBeDelivered = false;

    if (execution == 'installation')
      this.args.model.mustBeInstalled = true;
    else if (execution == 'delivery')
      this.args.model.mustBeDelivered = true;
  }

  @action
  setVisitor(visitor) {
    this.request.visitor = visitor ? visitor.firstName : null;
  }

  @action
  setTechnicians(employees) {
    this.args.model.technicians = employees;
  }
}
