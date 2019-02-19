import Component from '@ember/component';
import { computed } from '@ember/object';
import { A } from '@ember/array';
import { warn } from '@ember/debug';


export default Component.extend({
  tagName: '',
  size: 'xxlarge',
  label: 'Straat',
  address1: null,
  address2: null,
  address3: null,
  onBlur: null,

  value: computed('address1', 'address2', 'address3', {
    get(/*key*/) {
      let value = '';
      let i = 0;
      while(i < 3) {
        if (this.get(`address${i + 1}`))
          value += this.get(`address${i + 1}`);
        value += '\n';
        i++;
      }
      return value.replace(/[\s\uFEFF\xA0]+$/g, ''); // remove trailing newlines
    },
    set(key, value) {
      const lines = (value || '').split('\n');
      if (lines.length > 3)
        warn('Only 3 lines are allowed in the address text area', { id: 'input.too-many-address-lines' });
      let i = 0;
      while(i < 3) {
        this.set(`address${i + 1}`, lines[i] || undefined);
        i++;
      }
      return value;
    }
  }),
  errors: computed('value', function() {
    const errors = A();
    const lines = (this.value || '').split('\n');
    if (lines.length > 3)
      errors.pushObject("Adres mag maximaal 3 lijnen bevatten");
    return errors;
  })
});
