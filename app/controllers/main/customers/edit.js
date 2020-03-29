import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class EditController extends Controller {
  queryParams = ['editMode', 'selectedTab'];
  editMode = false;
  selectedTab = 2; // requests tab

  @action
  setTab(tab) {
    this.set('selectedTab', tab);
  }

  @action
  openEdit() {
    this.set('editMode', true);
  }

  @action
  closeEdit() {
    this.set('editMode', false);
  }

  @action
  onRemove() {
    this.transitionToRoute('main.customers.index');
  }
}
