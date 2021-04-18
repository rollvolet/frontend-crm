import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class DepositInvoicesController extends Controller {
  @service case

  get order() {
    return this.case.current && this.case.current.order;
  }

  @action
  updateList() {
    this.send('refreshModel');
  }
}
