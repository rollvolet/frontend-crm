import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { all, task } from 'ember-concurrency';
import { warn } from '@ember/debug';

export default class OrderPanelsComponent extends Component {
  @service('case') caseService;
  @service router;
  @service store;

  get case() {
    return this.caseService.current.case;
  }

  get isDisabledEdit() {
    return this.args.model.isMasteredByAccess || this.case.invoice.get('id') != null;
  }

  get isEnabledDelete() {
    return (
      !this.args.model.isMasteredByAccess &&
      !this.case.invoice.get('id') == null &&
      !this.args.model.deposits.length &&
      !this.case.depositInvoices.length
    );
  }

  @task
  *delete() {
    try {
      // TODO use this.args.model.invoicelines once the relation is defined
      const invoicelines = yield this.store.query('invoiceline', {
        'filter[:exact:order]': this.args.model.uri,
        sort: 'position',
        page: { size: 100 },
      });
      yield all(invoicelines.map((t) => t.destroyRecord()));
      yield this.caseService.current.updateRecord('order', null);

      // TODO fetch via relation once order is converted to triplestore
      const calendarEvent = yield this.store.queryOne('calendar-event', {
        'filter[:exact:order]': this.args.model.uri,
      });
      if (calendarEvent) {
        yield calendarEvent.destroyRecord();
      }
      yield this.args.model.destroyRecord();
      this.router.transitionTo('main.offers.edit', this.caseService.current.offer.id);
    } catch (e) {
      warn(`Something went wrong while destroying order ${this.args.model.id}`, {
        id: 'destroy-failure',
      });
      yield this.args.model.rollbackAttributes(); // undo delete-state
      yield this.caseService.current.updateRecord('order', this.args.model);
    }
  }
}
