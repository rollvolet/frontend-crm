import DS from 'ember-data';
import { computed } from '@ember/object';
import { bool } from '@ember/object/computed';
import moment from 'moment';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  visitDate: validator('presence', true)
});

export default DS.Model.extend(Validations, {
  visitDate: DS.attr('date'),
  period: DS.attr(),
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
  isMasteredByAccess: bool('calendarId')
});
