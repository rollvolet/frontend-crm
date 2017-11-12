import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  name: DS.attr(),
  address1: DS.attr(),
  address2: DS.attr(),
  address3: DS.attr(),
  number: DS.attr(),
  created: DS.attr('date', {
    defaultValue() { return new Date(); }
  }),
  updated: DS.attr('date', {
    defaultValue() { return new Date(); }
  }),
  customer: DS.belongsTo('customer'),
  country: DS.belongsTo('country'),
  language: DS.belongsTo('language'),
  postalCode: DS.belongsTo('postal-code'),

  address: computed('address1', 'address2', 'address3', function() {
    var address = '';
    if (this.get('address1')) { address += this.get('address1') + ' '; }
    if (this.get('address2')) { address += this.get('address2') + ' '; }
    if (this.get('address3')) { address += this.get('address3') + ' '; }
    return address.trim();
  })
});
