import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { A } from '@ember/array';
import { warn } from '@ember/debug';


export default Component.extend({
  tagName: '',
  size: 'xxlarge',
  label: 'Adres (max. 3 lijnen)',
  value: null,
  address1: null,
  address2: null,
  address3: null,
  valueChanged: observer('value', function() {
    const lines = (this.get('value') || '').split('\n');
    if (lines.length > 3)
      warn('Only 3 lines are allowed in the address text area', { id: 'input.too-many-address-lines' });
    let i = 0;
    while(i < 3) {
      this.set(`address${i + 1}`, lines[i] || undefined);
      i++;
    }
  }),
  errors: computed('value', function() {
    const errors = A();
    const lines = (this.get('value') || '').split('\n');
    if (lines.length > 3)
      errors.pushObject("Adres mag maximaal 3 lijnen bevatten");
    return errors;
  })
});
