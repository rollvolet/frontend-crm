import DS from 'ember-data';

export default DS.Model.extend({
  visitDate: DS.attr('date'),
  visitor: DS.attr(),
  offerExpected: DS.attr(),
  comment: DS.attr(),
  calendarSubject: DS.attr(),
  calendarId: DS.attr(),

  request: DS.belongsTo('request')
});
