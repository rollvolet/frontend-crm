import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import { cancelCase, reopenCase } from '../../utils/case-helpers';
import { updateCalendarEvent } from '../../utils/calendar-helpers';

export default class CaseTabsComponent extends Component {
  @service router;
  @service userInfo;

  @tracked isOpenCancellationModal = false;
  @tracked isExpandedComment = false;

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

  get isDisabledEditVatRate() {
    if (this.args.model.isIsolated || this.args.model.intervention.get('id')) {
      return this.args.model.invoice.get('isBooked');
    } else {
      return (
        this.args.model.order.get('id') ||
        this.args.model.invoice.get('id') ||
        this.args.model.depositInvoices.get('length') > 0
      );
    }
  }

  @keepLatestTask
  *setVatRate(vatRate) {
    this.args.model.vatRate = vatRate;
    const invoice = yield this.args.model.invoice;
    if (invoice) {
      const invoicelines = yield invoice.invoicelines;
      yield Promise.all(
        invoicelines.map((invoiceline) => {
          invoiceline.vatRate = vatRate;
          return invoiceline.save();
        })
      );
    }
  }

  @keepLatestTask
  *save() {
    yield this.args.model.save();
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
    await cancelCase(this.args.model, reason, this.userInfo.user);
  }

  @action
  async confirmReopen() {
    this.isOpenCancellationModal = false;
    await reopenCase(this.args.model);
  }

  @action
  async updateOrderPlanning() {
    const order = await this.args.model.order;
    await updateCalendarEvent({ order });
  }
}
