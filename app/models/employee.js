import Model, { attr, hasMany } from '@ember-data/model';

export default class EmployeeClass extends Model {
  @attr type;
  @attr firstName;
  @attr lastName;
  @attr initials;
  @attr comment;
  @attr active;
  @attr function;
  @hasMany('working-hour') workingHours;

  get isTechnician() {
    return this.type == 2;
  }

  get isAdministrative() {
    return this.type == 1;
  }
}
