import Service, { inject } from '@ember/service';

export default Service.extend({
  session: inject(),
  store: inject(),

  employee: undefined,

  async getCurrentEmployee() {
    if (this.employee === undefined) {
      const username = this.session.get('data.authenticated.user.name');
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
});
