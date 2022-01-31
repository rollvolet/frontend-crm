import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency';

export default class UserInfoService extends Service {
  @service session;
  @service store;

  @tracked name;
  @tracked username;
  @tracked userGroups = [];
  @tracked employee;

  get isLoaded() {
    return this.fetchUserInfo.last && this.fetchUserInfo.last.isSuccessful;
  }

  get isAdmin() {
    return this.userGroups.includes('http://data.rollvolet.be/user-groups/admin');
  }

  get isBoard() {
    return this.userGroups.includes('http://data.rollvolet.be/user-groups/board');
  }

  get isEmployee() {
    return this.userGroups.includes('http://data.rollvolet.be/user-groups/employee');
  }

  @keepLatestTask
  // eslint-disable-next-line require-yield
  *fetchUserInfo() {
    if (this.session.isAuthenticated) {
      const sessionData = this.session.data.authenticated.data;
      this.name = sessionData.attributes.name;
      this.username = sessionData.attributes.username;
      this.userGroups = sessionData.attributes['user-groups'];
    } else {
      this.name = null;
      this.username = null;
      this.userGroups = [];
    }
  }

  clearUserInfo() {
    this.name = null;
    this.username = null;
    this.userGroups = [];
  }

  async getEmployee() {
    if (this.employee === undefined) {
      if (this.name) {
        const firstName = this.name.split(' ')[0].toLowerCase();
        const employees = await this.store.findAll('employee'); // TODO convert to query
        const employee = employees.find((e) => e.firstName.toLowerCase() == firstName);
        this.employee = employee;
      } else {
        this.employee = null;
      }
    }
    return this.employee;
  }
}
