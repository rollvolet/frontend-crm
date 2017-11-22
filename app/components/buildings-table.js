import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  page: 0,
  size: 10,
  sort: 'name',
  buildings: computed('customer', 'page', 'size', 'sort', function() {
    return this.get('customer').query('buildings', {
      page: {
        size: this.get('size'),
        number: this.get('page')
      },
      sort: this.get('sort'),
      include: 'country,language,honorific-prefix'
    });
  })
});
