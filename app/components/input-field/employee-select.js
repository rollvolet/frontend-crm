import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { sort } from 'ember-awesome-macros/array';
import { proxyAware } from '../../utils/proxy-aware';

const filterKeys = ['isTechnician', 'isAdministrative', 'isOnRoad'];

export default Component.extend({
  store: service(),

  selected: proxyAware('value'),
  employees: computed('isActive', 'isTechnician', 'isAdministrative', 'isOnRoad', function() {
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
  }),
  optionSort: Object.freeze(['functionSort:asc']),
  options: sort('employees', 'optionSort'),
  placeholder: computed('label', 'required', function() {
    return this.required ? `${this.label} *` : this.label;
  }),
  label: 'Werknemer',
  type: null,
  function: null,
  value: null,
  errors: null,
  required: false,
  onSelectionChange: null,

  isActive: true,
  isTechnician: false,
  isAdministrative: false,
  isOnRoad: false
});
