import classic from 'ember-classic-decorator';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { sort } from 'ember-awesome-macros/array';
import { proxyAware } from '../../utils/proxy-aware';

const filterKeys = ['isTechnician', 'isAdministrative', 'isOnRoad'];

@classic
export default class EmployeeSelect extends Component {
  @service store

  @proxyAware('value')
  selected

  @computed('isActive', 'isTechnician', 'isAdministrative', 'isOnRoad')
  get employees() {
    let employees = this.store.peekAll('employee');

    if (this.isActive)
      employees = employees.filter(e => e.active);

    const enabledFilters = filterKeys.filter(key => this.get(key));
    if (enabledFilters.length) {
      const matches = function(employee) {
        for (let key of enabledFilters) {
          if (employee.get(key))
            return true;
        }
        return false;
      };
      employees = employees.filter(e => matches(e));
    }

    return employees;
  }

  optionSort = Object.freeze(['functionSort:asc'])
  @sort('employees', 'optionSort') options

  @computed('label', 'required')
  get placeholder() {
    return this.required ? `${this.label} *` : this.label;
  }

  label = 'Werknemer'
  type = null
  function = null
  value = null
  errors = null
  required = false
  onSelectionChange = null

  isActive = true
  isTechnician = false
  isAdministrative = false
  isOnRoad = false
}
