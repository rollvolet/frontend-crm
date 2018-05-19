import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  init() {
    this._super(...arguments);
    let employees = this.store.peekAll('employee');

    if (this.onlyActive)
      employees = employees.filter(e => e.active);

    if (this.type != null)
      employees = employees.filter(e => e.type == this.type);

    this.set('options', employees);
  },
  label: 'Werknemer',
  type: null,
  onlyActive: true,
  value: null,
  onSelectionChange: null
});
