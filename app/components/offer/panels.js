import Component from '@glimmer/component';
import { service } from '@ember/service';
import { all, task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import { isPresent } from '@ember/utils';

export default class OfferPanelsComponent extends Component {
  @service store;
  @service router;

  caseData = trackedFunction(this, async () => {
    return await this.args.model.case;
  });

  get case() {
    return this.caseData.value;
  }

  get isDisabledEdit() {
    return this.hasOrder || this.args.model.isMasteredByAccess || this.case?.isCancelled;
  }

  get isEnabledDelete() {
    return !this.hasOrder && !this.args.model.isMasteredByAccess && this.case?.isOngoing;
  }

  get hasOrder() {
    return isPresent(this.case?.order.get('id'));
  }

  @task
  *delete() {
    const _case = yield this.args.model.case;

    const offerlines = yield this.store.query('offerline', {
      'filter[offer][:uri:]': this.args.model.uri,
      sort: 'position',
      page: { size: 100 },
    });
    yield all(offerlines.map((t) => t.destroyRecord()));
    yield this.args.model.destroyRecord();

    const request = yield _case.request;
    this.router.transitionTo('main.case.request.edit.index', _case.id, request.id);
  }
}
