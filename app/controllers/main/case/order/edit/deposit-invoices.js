import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class MainCaseOrderEditDepositInvoicesController extends Controller {
  @service router;

  // Since the model is refreshed on creation of a new deposit-invoice
  // and we want to open this new deposit-invoice in edit mode,
  // the controller needs to keep track of the newly created deposit-invoice
  // such that is can be passed down to the component rendering the list of
  // deposit invoices.
  // We cannot store this state on the component itself, since it will be
  // destroyed on each refresh of the model hook.
  @tracked newlyCreatedDepositInvoice;

  @action
  updateList(depositInvoice) {
    this.newlyCreatedDepositInvoice = depositInvoice;
    this.router.refresh('main.case.order.edit.deposit-invoices');
  }

  @action
  resetNewlyCreatedDepositInvoice() {
    this.newlyCreatedDepositInvoice = null;
  }
}
