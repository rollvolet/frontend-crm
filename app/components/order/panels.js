import Component from '@glimmer/component';
import { service } from '@ember/service';
import { all, task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import { isPresent } from '@ember/utils';

export default class OrderPanelsComponent extends Component {
  @service router;
  @service store;

  caseData = trackedFunction(this, async () => {
    return await this.args.model.case;
  });

  get case() {
    return this.caseData.value;
  }

  get isDisabledEdit() {
    return this.hasInvoice || this.args.model.isMasteredByAccess || this.case?.isCancelled;
  }

  get isEnabledDelete() {
    return (
      !this.hasInvoice &&
      !this.hasDepositInvoices &&
      !this.args.model.isMasteredByAccess &&
      this.case?.isOngoing
    );
  }

  get hasDepositInvoices() {
    return this.case?.depositInvoices.get('length');
  }

  get hasInvoice() {
    return isPresent(this.case?.invoice.get('id'));
  }

  @task
  *delete() {
    const _case = yield this.args.model.case;

    const invoicelines = yield this.store.query('invoiceline', {
      'filter[order][:uri:]': this.args.model.uri,
      sort: 'position',
      page: { size: 100 },
    });
    yield all(invoicelines.map((t) => t.destroyRecord()));

    const calendarEvent = yield this.args.model.planning;
    if (calendarEvent) {
      yield calendarEvent.destroyRecord();
    }

    yield this.args.model.destroyRecord();

    const offer = yield _case.offer;
    this.router.transitionTo('main.case.offer.edit', _case.id, offer.id);
  }
}
