import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { sort } from 'ember-awesome-macros/array';
import { proxyAware } from '../utils/proxy-aware';

const groupByFunction = function(arr) { // eslint-disable-line no-unused-vars
  return arr.reduce(function(grouped, e) {
    const group = e.function ? e.function[0] : '';
    (grouped[group] = grouped[group] || []).push(e);
    return grouped;
  }, {});
};

export default Component.extend({
  store: service(),

  selected: proxyAware('value'),
  employees: computed('onlyActive', 'onlyWithFunction', 'type', 'function', function() {
    let employees = this.store.peekAll('employee');

    if (this.onlyActive)
      employees = employees.filter(e => e.active);

    if (this.onlyWithFunction)
      employees = employees.filter(e => e.function);

    if (this.type != null)
      employees = employees.filter(e => e.type == this.type);

    if (this.functions != null)
      employees = employees.filter(e => e.function && this.functions.includes(e.function.substr(0, 1)));

    return employees;
  }),
  options: sort('employees', ['function:asc']),
  placeholder: computed('label', 'required', function() {
    return this.required ? `${this.label} *` : this.label;
  }),
  label: 'Werknemer',
  type: null,
  function: null,
  onlyActive: true,
  onlyWithFunction: true,
  value: null,
  errors: null,
  required: false,
  onSelectionChange: null
});
