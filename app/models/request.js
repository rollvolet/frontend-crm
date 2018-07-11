import DS from 'ember-data';
import { computed } from '@ember/object';
import moment from 'moment';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  requestDate: validator('presence', true)
});

export default DS.Model.extend(Validations, {
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

  // TODO: create a computed property for dateStr
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
