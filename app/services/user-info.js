import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency';
import { cancel, later } from '@ember/runloop';
import fetchOAuthSession from '../utils/fetch-oauth-session';
import { TIMEOUTS } from '../config';
import constants from '../config/constants';

const { USER_GROUPS } = constants;

export default class UserInfoService extends Service {
  @service session;
  @service store;

  @tracked account;
  @tracked user;
  @tracked userGroups;
  @tracked employee;
  @tracked firstName; // firstName of logged in user, regardless of impersonation

  @tracked isOAuthConnected;
  @tracked scheduledOAuthConnectionPing;

  constructor() {
    super(...arguments);
    this.validateOAuthConnection();
  }

  get isLoaded() {
    return this.fetchUserInfo.last && this.fetchUserInfo.last.isSuccessful;
  }

  get isAdmin() {
    return this.userGroups.find((group) => group.uri == USER_GROUPS.ADMIN);
  }

  get isBoard() {
    return this.userGroups.find((group) => group.uri == USER_GROUPS.BOARD);
  }

  get isEmployee() {
    return this.userGroups.find((group) => group.uri == USER_GROUPS.EMPLOYEE);
  }

  get isImpersonation() {
    if (this.employee) {
      return this.employee.id != this.user.employee?.get('id');
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
      const sessionData = authenticatedData.data.relationships;
      const accountId = sessionData.account?.data.id;
      this.account = yield this.store.findRecord('account', accountId, {
        include: 'user.employee',
      });
      this.user = yield this.account.user;
      [this.userGroups, this.employee] = yield Promise.all([
        this.user.userGroups,
        this.user.employee,
      ]);
      this.firstName = this.employee ? this.employee.firstName : this.user.firstName;
    } else {
      this.account = null;
      this.user = null;
      this.firstName = null;
    }
  }

  async validateOAuthConnection() {
    if (this.session.isAuthenticated) {
      const oauthSession = await fetchOAuthSession();
      this.isOAuthConnected = oauthSession != null;
    } else {
      this.isOAuthConnected = true; // don't show warning if user is not logged in
    }

    this.scheduledOAuthConnectionPing = later(
      this,
      this.validateOAuthConnection,
      TIMEOUTS.OAUTH_SESSION_PING
    );
  }

  willDestroy() {
    super.willDestroy(...arguments);
    if (this.scheduledOAuthConnectionPing) {
      cancel(this.scheduledOAuthConnectionPing);
    }
  }
}
