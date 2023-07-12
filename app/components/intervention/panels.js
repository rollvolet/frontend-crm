import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import { isPresent } from '@ember/utils';

export default class InterventionPanelsComponent extends Component {
  @service router;

  caseData = trackedFunction(this, async () => {
    return await this.args.model.case;
  });

  get case() {
    return this.caseData.value;
  }

  get isDisabledEdit() {
    return this.hasInvoice || this.case?.isCancelled;
  }

  get isEnabledDelete() {
    return !this.hasInvoice && !this.case?.isCancelled;
  }

  get hasInvoice() {
    return isPresent(this.case?.invoice.get('id'));
  }

  @task
  *delete() {
    const customer = yield this.case.customer;
    try {
      const visit = yield this.request.visit;
      if (visit) {
        yield visit.destroyRecord();
      }
      yield this.args.model.destroyRecord();
      yield this.case.destroyRecord();
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
