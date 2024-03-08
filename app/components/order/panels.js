import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { task } from 'ember-concurrency';

export default class OrderPanelsComponent extends Component {
  @service router;
  @service store;

  @cached
  get case() {
    return new TrackedAsyncData(this.args.model.case);
  }

  @cached
  get depositInvoices() {
    if (this.case.isResolved) {
      return new TrackedAsyncData(this.case.value.depositInvoices);
    } else {
      return [];
    }
  }

  @cached
  get invoice() {
    if (this.case.isResolved) {
      return new TrackedAsyncData(this.case.value.invoice);
    } else {
      return null;
    }
  }

  get hasDepositInvoices() {
    return this.depositInvoices?.isResolved && this.depositInvoices.value.length > 0;
  }

  get hasInvoice() {
    return this.invoice?.isResolved && this.invoice.value != null;
  }

  get isDisabledEdit() {
    return (
      this.hasInvoice ||
      this.args.model.isMasteredByAccess ||
      (this.case.isResolved && this.case.value.isCancelled)
    );
  }

  get isEnabledDelete() {
    return (
      !this.hasInvoice &&
      !this.hasDepositInvoices &&
      !this.args.model.isMasteredByAccess &&
      this.case.isResolved &&
      this.case.value.isOngoing
    );
  }

  @task
  *delete() {
    const _case = yield this.args.model.case;

    const invoicelines = yield this.store.query('invoiceline', {
      'filter[order][:uri:]': this.args.model.uri,
      sort: 'position',
      page: { size: 100 },
    });
    yield Promise.all(invoicelines.map((t) => t.destroyRecord()));

    const calendarEvent = yield this.args.model.planning;
    if (calendarEvent) {
      yield calendarEvent.destroyRecord();
    }

    yield this.args.model.destroyRecord();

    const offer = yield _case.offer;
    this.router.transitionTo('main.case.offer.edit', _case.id, offer.id);
  }
}
