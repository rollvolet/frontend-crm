import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  name: DS.attr(),
  customers: DS.hasMany('customer'),
  entityId: computed('id', function() {
    return this.id.substring(0, this.id.indexOf('-'));
  }),
  languageId: computed('id', function() {
    return this.id.substring(this.id.indexOf('-') + 1);
  })
});

const composeId = function(entityId, languageId) {
  return `${entityId}-${languageId}`;
};

export { composeId };
