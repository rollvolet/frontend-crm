import Model, { attr, hasMany } from '@ember-data/model';
import { isPresent, isBlank } from '@ember/utils';
import constants from 'rollvolet-crm/config/constants';

const { EMPLOYEE_TYPES } = constants;

export default class EmployeeClass extends Model {
  @attr type;
  @attr firstName;
  @attr lastName;
  @attr initials;
  @attr('datetime') endDate;

  // TODO remove legacy ID conversion once employees are fully migrated to triplestore
  @attr uuid;

  @hasMany('request', { inverse: 'employee' }) acceptedRequests;
  @hasMany('request', { inverse: 'visitor' }) visitedRequests;
  @hasMany('intervention', { inverse: 'employee' }) acceptedInterventions;
  @hasMany('intervention', { inverse: 'technicians' }) interventions;
  @hasMany('order', { inverse: 'technicians' }) orders;
  @hasMany('technical-work-activities', { inverse: 'employee' }) technicalWorkActivities;

  get isTechnician() {
    // TODO remove filter on int once employees are fully migrated to triplestore
    return this.type == EMPLOYEE_TYPES.TECHNICIAN || this.type == 2;
  }

  get isAdministrative() {
    // TODO remove filter on int once employees are fully migrated to triplestore
    return this.type == EMPLOYEE_TYPES.ADMINISTRATIVE || this.type == 1;
  }

  get isActive() {
    return isBlank(this.endDate);
  }

  get fullName() {
    return [this.firstName, this.lastName].filter((e) => isPresent(e)).join(' ');
  }
}
