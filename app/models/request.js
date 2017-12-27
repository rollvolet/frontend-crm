import DS from 'ember-data';

export default DS.Model.extend({
  requestDate: DS.attr('date'),
  requiresVisit: DS.attr(),
  comment: DS.attr(),
  employee: DS.attr(),
  updated: DS.attr('date', {
    defaultValue() { return new Date(); }
  }),
  customer: DS.belongsTo('customer'),
  contact: DS.belongsTo('contact'),
  building: DS.belongsTo('building'),
  wayOfEntry: DS.belongsTo('way-of-entry')
});
