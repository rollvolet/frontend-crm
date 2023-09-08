import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MainCustomersEditIndexController extends Controller {
  @service router;

  queryParams = ['tab'];
  @tracked tab = 'requests';

  @action
  goToCustomerIndex() {
    this.router.transitionTo('main.customers.index');
  }
}
