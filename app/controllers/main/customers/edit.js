import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Controller from '@ember/controller';

@classic
export default class EditController extends Controller {
  queryParams = ['editMode', 'selectedTab'];
  editMode = false;
  selectedTab = 2; // requests tab

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
