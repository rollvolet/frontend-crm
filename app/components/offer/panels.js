import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';

export default class OfferPanelsComponent extends Component {
  @service store;
  @service router;

  @tracked isOpenUnableToDeleteModal = false;

  @cached
  get case() {
    return new TrackedAsyncData(this.args.model.case);
  }

  @cached
  get order() {
    if (this.case.isResolved) {
      return new TrackedAsyncData(this.case.value.order);
    } else {
      return null;
    }
  }

  get hasOrder() {
    return this.order?.isResolved && this.order.value != null;
  }

  get isDisabledEdit() {
    return (
      this.hasOrder ||
      this.args.model.isMasteredByAccess ||
      (this.case.isResolved && this.case.value.isCancelled)
    );
  }

  get isEnabledDelete() {
    return (
      !this.hasOrder ||
      !this.args.model.isMasteredByAccess ||
      (this.case.isResolved && this.case.value.isOngoing)
    );
  }

  @task
  *delete() {
    const order = yield this.store.queryOne('order', {
      'filter[case][offer][:id:]': this.args.model.id,
    });

    if (order) {
      this.isOpenUnableToDeleteModal = true;
    } else {
      const _case = yield this.args.model.case;

      const offerlines = yield this.store.query('offerline', {
        'filter[offer][:uri:]': this.args.model.uri,
        sort: 'position',
        page: { size: 100 },
      });
      yield Promise.all(offerlines.map((t) => t.destroyRecord()));
      yield this.args.model.destroyRecord();

      const request = yield _case.request;
      this.router.transitionTo('main.case.request.edit.index', _case.id, request.id);
    }
  }

  @action
  closeUnableToDeleteModal() {
    this.isOpenUnableToDeleteModal = false;
  }
}
