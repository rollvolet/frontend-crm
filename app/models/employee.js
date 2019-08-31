import DS from 'ember-data';
import { and, conditional, eq, or, raw } from 'ember-awesome-macros';

export default DS.Model.extend({
  type: DS.attr(),
  firstName: DS.attr(),
  lastName: DS.attr(),
  initials: DS.attr(),
  comment: DS.attr(),
  active: DS.attr(),
  function: DS.attr(),
  workingHours: DS.hasMany('working-hour'),

  functionSort: conditional('function', 'function', raw('Z')),
  isTechnician: eq('type', raw(2)),
  isAdministrative: or(eq('type', raw(0)), eq('type', raw(1))),
  isOnRoad: and(eq('type', raw(1)), eq('function', raw('B')))
});
