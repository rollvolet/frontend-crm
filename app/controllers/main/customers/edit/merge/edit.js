import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class MainCustomersEditMergeEditController extends Controller {
  @service router;

  @action
  navigateToMergedCustomer(customer) {
    this.router.transitionTo('main.customers.edit.index', customer.id);
  }
}
