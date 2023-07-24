import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { cancelCase, reopenCase } from '../../utils/case-helpers';

export default class CaseTabsComponent extends Component {
  @service router;

  @tracked isOpenCancellationModal = false;

  get currentStep() {
    if (this.args.model.invoice.get('id')) {
      return 'invoice';
    } else if (this.args.model.intervention.get('id')) {
      return 'intervention';
    } else if (this.args.model.order.get('id')) {
      return 'order';
    } else if (this.args.model.offer.get('id')) {
      return 'offer';
    } else {
      return 'request';
    }
  }

  get selectedStep() {
    const route = this.router.currentRoute.name.substr('main.case.'.length); // e.g. main.case.request.edit
    if (route.includes('deposit-invoices')) {
      return 'deposit-invoices';
    } else {
      return route.substr(0, route.indexOf('.'));
    }
  }

  @action
  openCancellationModal() {
    this.isOpenCancellationModal = true;
  }

  @action
  closeCancellationModal() {
    this.isOpenCancellationModal = false;
  }

  @action
  async confirmCancellation(reason) {
    this.isOpenCancellationModal = false;
    await cancelCase(this.args.model, reason);
  }

  @action
  async confirmReopen() {
    this.isOpenCancellationModal = false;
    await reopenCase(this.args.model);
  }
}
