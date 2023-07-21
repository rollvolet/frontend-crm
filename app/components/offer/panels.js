import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { all, task } from 'ember-concurrency';
import { warn } from '@ember/debug';
import { trackedFunction } from 'ember-resources/util/function';
import { isPresent } from '@ember/utils';

export default class OfferPanelsComponent extends Component {
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
    return !this.hasOrder && !this.args.model.isMasteredByAccess && !this.case?.isCancelled;
  }

  get hasOrder() {
    return isPresent(this.case?.order.get('id'));
  }

  @task
  *delete() {
    try {
      const offerlines = yield this.store.query('offerline', {
        'filter[offer][:uri:]': this.args.model.uri,
        sort: 'position',
        page: { size: 100 },
      });
      yield all(offerlines.map((t) => t.destroyRecord()));
      yield this.args.model.destroyRecord();
      const request = yield this.case.request;
      this.router.transitionTo('main.case.request.edit.index', this.case.id, request.id);
    } catch (e) {
      warn(`Something went wrong while destroying offer ${this.args.model.id}`, {
        id: 'destroy-failure',
      });
      yield this.args.model.rollbackAttributes(); // undo delete-state
    }
  }
}
