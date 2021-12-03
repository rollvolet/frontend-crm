import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task } from 'ember-concurrency';

export default class InterventionPanelsComponent extends Component {
  @service case;
  @service router;

  get isDisabledEdit() {
    return this.hasInvoice || this.args.model.isCancelled;
  }

  get isEnabledDelete() {
    return !this.hasInvoice && !this.args.model.isCancelled;
  }

  get hasInvoice() {
    return this.case.current && this.case.current.invoice != null;
  }

  @task
  *remove() {
    const customer = this.case.current.customer;
    const planningEvent = yield this.args.model.planningEvent;
    try {
      if (planningEvent && planningEvent.isPlanned) {
        planningEvent.date = null;
        yield planningEvent.save();
      }
      yield this.args.model.destroyRecord();
    } catch (e) {
      warn(`Something went wrong while destroying intervention ${this.args.model.id}`, {
        id: 'destroy-failure',
      });
      yield this.args.model.rollbackAttributes(); // undo delete-state
    } finally {
      if (customer) {
        this.router.transitionTo('main.customers.edit', customer);
      } else {
        this.router.transitionTo('main.interventions.index');
      }
    }
  }
}
