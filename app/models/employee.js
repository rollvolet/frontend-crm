import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { isPresent, isBlank } from '@ember/utils';
import constants from 'rollvolet-crm/config/constants';

const { EMPLOYEE_TYPES } = constants;

export default class EmployeeClass extends Model {
  @attr('string') uri;
  @attr('string') type;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') initials;
  @attr('datetime') endDate;

  @belongsTo('user', { inverse: 'employee', async: true }) user;
  @hasMany('request', { inverse: 'employee', async: true }) acceptedRequests;
  @hasMany('request', { inverse: 'visitor', async: true }) visitedRequests;
  @hasMany('intervention', { inverse: 'employee', async: true }) acceptedInterventions;
  @hasMany('intervention', { inverse: 'technicians', async: true }) interventions;
  @hasMany('order', { inverse: 'technicians', async: true }) orders;
  @hasMany('technical-work-activities', {
    inverse: 'employee',
    async: true,
  })
  technicalWorkActivities;

  get isTechnician() {
    return this.type == EMPLOYEE_TYPES.TECHNICIAN;
  }

  get isAdministrative() {
    return this.type == EMPLOYEE_TYPES.ADMINISTRATIVE;
  }

  get isActive() {
    return isBlank(this.endDate);
  }

  get fullName() {
    return [this.firstName, this.lastName].filter((e) => isPresent(e)).join(' ');
  }
}
