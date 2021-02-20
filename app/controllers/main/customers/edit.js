import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class EditController extends Controller {
  queryParams = ['editMode', 'tab'];
  editMode = false;
  tab = 'requests';

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
