import Model, { attr, hasMany } from '@ember-data/model';
import { isPresent, isBlank } from '@ember/utils';
import CONSTANTS from 'rollvolet-crm/config/constants';

export default class EmployeeClass extends Model {
  @attr type;
  @attr firstName;
  @attr lastName;
  @attr initials;
  @attr('datetime') endDate;

  // TODO remove legacy ID conversion once employees are fully migrated to triplestore
  @attr uuid;

  @hasMany('technical-work-activities', { inverse: 'employee' }) technicalWorkActivities;

  get isTechnician() {
    // TODO remove filter on int once employees are fully migrated to triplestore
    return this.type == CONSTANTS.EMPLOYEE_TYPES.TECHNICIAN || this.type == 2;
  }

  get isAdministrative() {
    // TODO remove filter on int once employees are fully migrated to triplestore
    return this.type == CONSTANTS.EMPLOYEE_TYPES.ADMINISTRATIVE || this.type == 1;
  }

  get isActive() {
    return isBlank(this.endDate);
  }

  get fullName() {
    return [this.firstName, this.lastName].filter((e) => isPresent(e)).join(' ');
  }
}
