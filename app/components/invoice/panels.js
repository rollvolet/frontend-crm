import Component from '@glimmer/component';
import { trackedFunction } from 'ember-resources/util/function';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { warn } from '@ember/debug';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class InvoicePanelsComponent extends Component {
  @service sequence;
  @service store;
  @service router;

  @tracked isOpenUnableToDeleteModal = false;

  caseData = trackedFunction(this, async () => {
    return await this.args.model.case;
  });

  isLastInvoiceData = trackedFunction(this, async () => {
    const nextInvoiceNumber = await this.sequence.fetchNextInvoiceNumber();
    return nextInvoiceNumber == this.args.model.number + 1;
  });

  get case() {
    return this.caseData.value;
  }

  get isDisabledEdit() {
    return this.args.model.isMasteredByAccess || this.case?.isCancelled;
  }

  get isEnabledDelete() {
    return (
      this.isLastInvoiceData.value &&
      !this.args.model.isBooked &&
      !this.args.model.isMasteredByAccess &&
      this.case?.isOngoing
    );
  }

  @task
  *delete() {
    try {
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

        const [intervention, order, customer] = yield Promise.all([
          this.case.intervention,
          this.case.order,
          this.case.customer,
        ]);
        const caseId = this.case.id;
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
    } catch (e) {
      warn(`Something went wrong while destroying invoice ${this.args.model.id}`, {
        id: 'destroy-failure',
      });
      yield this.args.model.rollbackAttributes(); // undo delete-state
    }
  }

  @action
  closeUnableToDeleteModal() {
    this.isOpenUnableToDeleteModals = false;
  }
}
