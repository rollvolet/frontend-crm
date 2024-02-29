import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { service } from '@ember/service';
import { warn } from '@ember/debug';
import { task } from 'ember-concurrency';

export default class InterventionPanelsComponent extends Component {
  @service router;

  @cached
  get case() {
    return new TrackedAsyncData(this.args.model.case);
  }

  @cached
  get invoice() {
    if (this.case.isResolved) {
      return new TrackedAsyncData(this.case.value.invoice);
    } else {
      return null;
    }
  }

  get hasInvoice() {
    return this.invoice?.isResolved && this.invoice.value != null;
  }

  get isDisabledEdit() {
    return (this.case.isResolved && this.case.value.isCancelled) || this.hasInvoice;
  }

  get isEnabledDelete() {
    return (
      this.case.isResolved &&
      this.case.value.isOngoing &&
      this.invoice?.isResolved &&
      this.invoice.value == null
    );
  }

  @task
  *delete() {
    const _case = yield this.args.model.case;
    const customer = yield _case.value.customer;
    try {
      const visit = yield this.args.model.visit;
      if (visit) {
        yield visit.destroyRecord();
      }
      yield this.args.model.destroyRecord();
      yield _case.destroyRecord();
    } catch (e) {
      warn(`Something went wrong while destroying intervention ${this.args.model.id}`, {
        id: 'destroy-failure',
      });
      yield this.args.model.rollbackAttributes(); // undo delete-state
    } finally {
      if (customer) {
        this.router.transitionTo('main.customers.edit.index', customer.id);
      } else {
        this.router.transitionTo('main.interventions.index');
      }
    }
  }
}
