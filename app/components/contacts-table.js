import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  page: 0,
  size: 10,
  contacts: computed('customer', 'page', 'size', function() {
    return this.get('customer').query('contacts', {
      page: {
        size: this.get('size'),
        number: this.get('page')
      }
    });
  })
});
