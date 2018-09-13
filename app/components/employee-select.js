import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { sort } from 'ember-awesome-macros/array';
import { proxyAware } from '../utils/proxy-aware';

const groupByFunction = function(arr) {
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

    if (this.function != null)
      employees = employees.filter(e => e.function && e.function.startsWith(this.function));

    return employees;
  }),
  options: sort('employees', ['function:asc']),
  label: 'Werknemer',
  type: null,
  function: null,
  onlyActive: true,
  onlyWithFunction: true,
  value: null,
  onSelectionChange: null
});
