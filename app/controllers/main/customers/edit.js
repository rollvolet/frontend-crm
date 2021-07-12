import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class EditController extends Controller {
  queryParams = ['tab'];
  tab = 'requests';

  @action
  onRemove() {
    this.transitionToRoute('main.customers.index');
  }
}
