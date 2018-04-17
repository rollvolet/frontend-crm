import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  code: DS.attr(),
  name: DS.attr(),
  search: computed('code', 'name', function() {
    return `${this.get('code')} ${this.get('name')}`;
  })
});
