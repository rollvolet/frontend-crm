import Service, { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

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
  *fetchUserInfo() {
    // eslint-disable-line require-yield
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
      if (this.username) {
        const firstName = this.username.split(' ')[0].toLowerCase();
        const employees = await this.store.findAll('employee'); // TODO convert to query
        const employee = employees.find((e) => e.firstName.toLowerCase() == firstName);
        this.set('employee', employee);
      } else {
        this.set('employee', null);
      }
    }
    return this.employee;
  }
}
