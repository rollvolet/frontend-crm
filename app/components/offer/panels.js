import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { all, task } from 'ember-concurrency';
import { warn } from '@ember/debug';

export default class OfferPanelsComponent extends Component {
  @service case;
  @service router;
  @service store;

  get isDisabledEdit() {
    return this.args.model.isMasteredByAccess || this.case.current.order != null;
  }

  get isEnabledDelete() {
    return !this.args.model.isMasteredByAccess && this.case.current.order == null;
  }

  @task
  *delete() {
    try {
      // TODO use this.args.model.offerlines once the relation is defined
      const offerlines = yield this.store.query('offerline', {
        'filter[offer]': this.args.model.uri,
        sort: 'sequence-number',
        page: { size: 100 },
      });
      yield all(offerlines.map((t) => t.destroyRecord()));
      this.case.updateRecord('offer', null);
      yield this.args.model.destroyRecord();
      this.router.transitionTo('main.case.request.edit', this.case.current.request.id);
    } catch (e) {
      warn(`Something went wrong while destroying offer ${this.args.model.id}`, {
        id: 'destroy-failure',
      });
      yield this.args.model.rollbackAttributes(); // undo delete-state
      this.case.updateRecord('offer', this.args.model);
    }
  }
}
