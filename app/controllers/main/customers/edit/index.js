import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MainCustomersEditIndexController extends Controller {
  @service router;

  queryParams = ['tab'];
  tab = 'requests';

  @action
  goToCustomerIndex() {
    this.router.transitionTo('main.customers.index');
  }
}
