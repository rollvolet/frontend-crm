import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  options: computed('onlyActive', 'type', 'function', function() {
    let employees = this.store.peekAll('employee');

    if (this.onlyActive)
      employees = employees.filter(e => e.active);

    if (this.type != null)
      employees = employees.filter(e => e.type == this.type);

    if (this.function != null)
      employees = employees.filter(e => e.function && e.function.startsWith(this.function));

    return employees;
  }),
  label: 'Werknemer',
  type: null,
  function: null,
  onlyActive: true,
  value: null,
  onSelectionChange: null
});
