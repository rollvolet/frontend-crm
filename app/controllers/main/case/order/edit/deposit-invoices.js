import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class DepositInvoicesController extends Controller {
  @service case;

  // Since the model is refreshed on creation of a new deposit-invoice
  // and we want to open this new deposit-invoice in edit mode,
  // the controller needs to keep track of the newly created deposit-invoice
  // such that is can be passed down to the component rendering the list of
  // deposit invoices.
  // We cannot store this state on the component itself, since it will be
  // destroyed on each refresh of the model hook.
  @tracked newlyCreatedDepositInvoice;

  get order() {
    return this.case.current && this.case.current.order;
  }

  @action
  updateList(depositInvoice) {
    this.newlyCreatedDepositInvoice = depositInvoice;
    this.send('refreshModel');
  }

  @action
  resetNewlyCreatedDepositInvoice() {
    this.newlyCreatedDepositInvoice = null;
  }
}
