import Service, { inject } from '@ember/service';

export default class CurrentSessionService extends Service {
  @inject session
  @inject store

  employee = undefined;

  get hasBoardRole() {
    return this.hasRole('board');
  }

  get hasMemberRole() {
    return this.hasRole('member');
  }

  hasRole(role) {
    const roles = this.session.data.authenticated.user.roles || [];
    return roles.includes(role);
  }

  async getCurrentEmployee() {
    if (this.employee === undefined) {
      const username = this.session.data.authenticated.user.name;
      if (username) {
        const firstName = username.split(' ')[0].toLowerCase();
        const employees = await this.store.findAll('employee');
        const employee = employees.find(e => e.firstName.toLowerCase() == firstName);
        this.set('employee', employee);
      } else {
        this.set('employee', null);
      }
    }
    return this.employee;
  }
}
