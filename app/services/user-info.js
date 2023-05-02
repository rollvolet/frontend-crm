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

  get firstName() {
    // TODO this is only a best guess. Get correct first name from DB.
    return this.name.split(' ')[0];
  }

  get email() {
    return this.username;
  }

  get isImpersonation() {
    if (this.employee) {
      const employeeFirstName = this.employee.firstName.toLowerCase();
      const userFirstName = this.firstName.toLowerCase();
      return !employeeFirstName.startsWith(userFirstName);
    } else {
      return false;
    }
  }

  @keepLatestTask
  *fetchUserInfo() {
    if (this.session.isAuthenticated) {
      const sessionData = this.session.data.authenticated.data;
      this.name = sessionData.attributes.name;
      this.username = sessionData.attributes.username;
      this.userGroups = sessionData.attributes['user-groups'];
      yield this.fetchEmployee();
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

  async fetchEmployee() {
    if (this.employee === undefined) {
      if (this.name) {
        const userFirstName = this.firstName.toLowerCase();
        // TODO convert findAll to query
        const employees = await this.store.query('employee', {
          'page[size]': 1000,
          sort: 'first-name',
        });
        const employee = employees
          .filter((e) => e.isAdministrative || e.isExternal)
          .find((e) => {
            // First check on exact match of firstname. Fallback to weaker startsWith check
            // to cover for cases of duplicate firstnames (e.g. 'Kevin S.' vs 'Kevin P.')
            // TODO Fix to exact match once employees are converted to triplestore
            // and have cleaned up names.
            const employeeFirstName = e.firstName.toLowerCase();
            const exactMatch = employeeFirstName == userFirstName;
            return exactMatch || employeeFirstName.startsWith(userFirstName);
          });
        this.employee = employee;
      } else {
        this.employee = null;
      }
    }
    return this.employee;
  }
}
