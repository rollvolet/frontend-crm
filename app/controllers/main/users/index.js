import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import constants from '../../../config/constants';

const { EMPLOYEE_TYPES } = constants;

export default class MainUsersIndexController extends Controller {
  @service router;
  @service store;

  @tracked page = 0;
  @tracked size = 50;
  @tracked sort = '-user.user-groups,types,first-name';
  @tracked onlyActive = true;
  @tracked selectedEmployee;

  get isOpenEditModal() {
    return this.selectedEmployee != null;
  }

  @action
  createNewEmployee() {
    const employee = this.store.createRecord('employee', {
      type: EMPLOYEE_TYPES.ADMINISTRATIVE,
    });
    this.selectedEmployee = employee;
  }

  @action
  openEditModal(employee) {
    this.selectedEmployee = employee;
  }

  @action
  closeEditModal() {
    this.selectedEmployee = null;
  }

  @action
  refreshModel() {
    this.closeEditModal();
    this.router.refresh('main.users.index');
  }

  @action
  previousPage() {
    this.selectPage(this.page - 1);
  }

  @action
  nextPage() {
    this.selectPage(this.page + 1);
  }

  @action
  selectPage(page) {
    this.page = page;
  }
}
