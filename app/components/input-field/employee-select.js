import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { sort } from '@ember/object/computed';

export default class EmployeeSelect extends Component {
  @service store;

  get employees() {
    let employees = this.store.peekAll('employee');

    if (this.isActive) {
      employees = employees.filter((e) => e.active);
    }

    const enabledFilters = ['isTechnician', 'isAdministrative'].filter((key) => this[key]);
    if (enabledFilters.length) {
      const matches = function (employee) {
        for (let key of enabledFilters) {
          if (employee[key]) {
            return true;
          }
        }
        return false;
      };
      employees = employees.filter((e) => matches(e));
    }

    return employees;
  }

  get sort() {
    if (this.args.sort == 'type:desc') {
      return 'isAdministrative'; // technicians come first
    } else {
      return 'isTechnician'; // administration comes first
    }
  }

  get options() {
    return this.employees.sortBy(this.sort);
  }

  get required() {
    return this.args.required || false;
  }

  get allowClear() {
    return this.args.allowClear !== false; // default to true
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
}
