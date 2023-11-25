import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency';

export default class UserInfoService extends Service {
  @service session;
  @service store;

  @tracked name;
  @tracked username;
  @tracked userGroups = [];
  @tracked user;
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
    return this.name?.split(' ')[0];
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

  impersonate(asEmployee) {
    this.employee = asEmployee;
  }

  async resetImpersonation() {
    this.employee = await this.user.employee;
  }

  @keepLatestTask
  *fetchUserInfo() {
    if (this.session.isAuthenticated) {
      const authenticatedData = this.session.data.authenticated;
      // TODO: response in msal-login service must be fixed. Relationships must be included in data object
      const sessionData = authenticatedData.relationships || authenticatedData.data.relationships;
      const accountId = sessionData.account?.data.id;
      const account = yield this.store.findRecord('account', accountId);
      this.user = yield account.user;
      this.name = this.user.name;
      this.username = account.accountName;
      this.userGroups = this.user.userGroups;
      yield this.fetchEmployee();
    } else {
      this.user = null;
      this.name = null;
      this.username = null;
      this.userGroups = [];
    }
  }

  async fetchEmployee() {
    if (this.employee === undefined) {
      if (this.name) {
        const userFirstName = this.firstName.toLowerCase();
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
