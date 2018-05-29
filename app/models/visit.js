import DS from 'ember-data';
import { computed } from '@ember/object';
import { bool, not } from '@ember/object/computed';
import moment from 'moment';

export default DS.Model.extend({
  visitDate: DS.attr('date'),
  visitor: DS.attr(),
  offerExpected: DS.attr(),
  comment: DS.attr(),
  calendarSubject: DS.attr(),
  calendarId: DS.attr(),
  msObjectId: DS.attr(),

  request: DS.belongsTo('request'),

  // TODO: create a computed property for dateStr
  visitDateStr: computed('visitDate', {
    get() {
      if (this.visitDate)
        return moment(this.visitDate).format('YYYY-MM-DD');
      else
        return null;
    },
    set(key, value) {
      const date = value ? new Date(value) : null;
      this.set('visitDate', date);
      return value;
    }
  }),

  isMastered: bool('msObjectId'),
  isMasteredByAccess: not('isMastered')
});
