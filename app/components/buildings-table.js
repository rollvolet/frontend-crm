import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  page: 0,
  size: 10,
  buildings: computed('customer', 'page', 'size', function() {
    return this.get('customer').query('buildings', {
      page: {
        size: this.get('size'),
        number: this.get('page')
      }
    });
  })
});
