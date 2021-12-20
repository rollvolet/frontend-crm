import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency';

export default class UserInfoService extends Service {
  @service session;
  @service store;

  @tracked name;
  @tracked username;
  @tracked employee;

  get hasBoardRole() {
    return this.hasRole('board');
  }

  get hasMemberRole() {
    return this.hasRole('member');
  }

  hasRole(/*role*/) {
    // TODO fix
    return false;
  }

  get isLoaded() {
    return this.fetchUserInfo.last && this.fetchUserInfo.last.isSuccessful;
  }

  @keepLatestTask
  // eslint-disable-next-line require-yield
  *fetchUserInfo() {
    if (this.session.isAuthenticated) {
      const sessionData = this.session.data.authenticated.data;
      this.name = sessionData.attributes.name;
      this.username = sessionData.attributes.username;
    } else {
      this.name = null;
      this.username = null;
    }
  }

  clearUserInfo() {
    this.name = null;
    this.username = null;
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
