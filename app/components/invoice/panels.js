import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { warn } from '@ember/debug';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class InvoicePanelsComponent extends Component {
  @service sequence;
  @service store;
  @service router;

  @tracked isOpenUnableToDeleteModal = false;

  @cached
  get case() {
    return new TrackedAsyncData(this.args.model.case);
  }

  @cached
  get nextInvoiceNumber() {
    return new TrackedAsyncData(this.sequence.fetchNextInvoiceNumber());
  }

  get isLastInvoice() {
    if (this.nextInvoiceNumber.isResolved) {
      return this.nextInvoiceNumber.value == this.args.model.number + 1;
    } else {
      return false;
    }
  }

  get isDisabledEdit() {
    return (
      this.args.model.isMasteredByAccess || (this.case.isResolved && this.case.value.isCancelled)
    );
  }

  get isEnabledDelete() {
    return (
      this.isLastInvoice &&
      !this.args.model.isBooked &&
      !this.args.model.isMasteredByAccess &&
      this.case.isResolved &&
      this.case.value.isOngoing
    );
  }

  @task
  *delete() {
    const nextInvoiceNumber = yield this.sequence.fetchNextInvoiceNumber();
    if (nextInvoiceNumber == this.args.model.number + 1) {
      const invoicelines = yield this.store.query('invoiceline', {
        'filter[invoice][:uri:]': this.args.model.uri,
        sort: 'position',
        page: { size: 100 },
      });
      yield Promise.all(
        invoicelines.map((invoiceline) => {
          invoiceline.invoice = null;
          return invoiceline.save();
        })
      );

      const _case = yield this.args.model.case;
      const [intervention, order, customer] = yield Promise.all([
        _case.intervention,
        _case.order,
        _case.customer,
      ]);
      const caseId = _case.id;
      yield this.args.model.destroyRecord();

      if (intervention) {
        this.router.transitionTo('main.case.intervention.edit', caseId, intervention.id);
      } else if (order) {
        this.router.transitionTo('main.case.order.edit', caseId, order.id);
      } else if (customer) {
        this.router.transitionTo('main.customers.edit.index', customer.id);
      } else {
        this.router.transitionTo('main.index');
      }
    } else {
      warn(`Not the last invoice anymore. Unable to destroy.`, { id: 'destroy-failure' });
      this.isOpenUnableToDeleteModal = true;
    }
  }

  @action
  closeUnableToDeleteModal() {
    this.isOpenUnableToDeleteModal = false;
  }
}
