import DS from 'ember-data';

export default DS.Model.extend({
  type: DS.attr(),
  firstName: DS.attr(),
  lastName: DS.attr(),
  initials: DS.attr(),
  comment: DS.attr(),
  active: DS.attr(),
  function: DS.attr(),
  workingHours: DS.hasMany('working-hour')
});
