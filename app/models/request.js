import { computed } from '@ember/object';
import DS from 'ember-data';
import moment from 'moment';

export default DS.Model.extend({
  requestDate: DS.attr('date'),
  requiresVisit: DS.attr(),
  comment: DS.attr(),
  employee: DS.attr(),
  customer: DS.belongsTo('customer'),
  contact: DS.belongsTo('contact'),
  building: DS.belongsTo('building'),
  wayOfEntry: DS.belongsTo('way-of-entry'),
  visit: DS.belongsTo('visit'),
  offer: DS.belongsTo('offer'),

  requestDateStr: computed('requestDate', {
    get() {
      if (this.requestDate)
        return moment(this.requestDate).format('YYYY-MM-DD');
      else
        return null;
    },
    set(key, value) {
      const date = value ? new Date(value) : null;
      this.set('requestDate', date);
      return value;
    }
  })
});
