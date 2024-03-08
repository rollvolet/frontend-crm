import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import { cancelCase, reopenCase } from '../../utils/case-helpers';
import { updateCalendarEvent } from '../../utils/calendar-helpers';

export default class CaseHeaderPanelComponent extends Component {
  @service router;
  @service userInfo;

  @tracked isOpenCancellationModal = false;
  @tracked isExpandedComment = false;

  @cached
  get request() {
    return new TrackedAsyncData(this.args.model.request);
  }

  get hasRequest() {
    return this.request.isResolved && this.request.value != null;
  }

  @cached
  get intervention() {
    return new TrackedAsyncData(this.args.model.intervention);
  }

  get hasIntervention() {
    return this.intervention.isResolved && this.intervention.value != null;
  }

  @cached
  get offer() {
    return new TrackedAsyncData(this.args.model.offer);
  }

  get hasOffer() {
    return this.offer.isResolved && this.offer.value != null;
  }

  @cached
  get order() {
    return new TrackedAsyncData(this.args.model.order);
  }

  get hasOrder() {
    return this.order.isResolved && this.order.value != null;
  }

  @cached
  get depositInvoices() {
    return new TrackedAsyncData(this.args.model.depositInvoices);
  }

  get hasDepositInvoices() {
    return this.depositInvoices.isResolved && this.depositInvoices.value.length > 0;
  }

  @cached
  get invoice() {
    return new TrackedAsyncData(this.args.model.invoice);
  }

  get hasInvoice() {
    return this.invoice.isResolved && this.invoice.value != null;
  }

  get currentStep() {
    if (this.hasInvoice) {
      return 'invoice';
    } else if (this.hasIntervention) {
      return 'intervention';
    } else if (this.hasOrder) {
      return 'order';
    } else if (this.hasOffer) {
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
    if (this.args.model.isIsolated || this.hasIntervention) {
      return this.hasInvoice && this.invoice.value.isBooked;
    } else {
      return this.hasOrder || this.hasInvoice || this.hasDepositInvoices;
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
