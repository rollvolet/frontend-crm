import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class EmployeeSelect extends Component {
  @service store

  get employees() {
    let employees = this.store.peekAll('employee');

    if (this.isActive)
      employees = employees.filter(e => e.active);

    const enabledFilters = ['isTechnician', 'isAdministrative', 'isOnRoad'].filter(key => this[key]);
    if (enabledFilters.length) {
      const matches = function(employee) {
        for (let key of enabledFilters) {
          if (employee[key])
            return true;
        }
        return false;
      };
      employees = employees.filter(e => matches(e));
    }

    return employees;
  }

  get sort() {
    return this.args.sort || ['functionSort'];
  }

  get options() {
    return this.employees.sortBy(...this.sort);
  }

  get required() {
    return this.args.required || false;
  }

  get placeholder() {
    return this.required && this.args.label ? `${this.args.label} *` : this.args.label;
  }

  get isActive() {
    return this.args.isActive !== false; // default to true
  }

  get isTechnician() {
    return this.args.isTechnician || false;
  }

  get isAdministrative() {
    return this.args.isAdministrative || false;
  }

  get isOnRoad() {
    return this.args.isOnRoad || false;
  }
}
