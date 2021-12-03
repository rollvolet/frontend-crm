import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { all, task } from 'ember-concurrency';
import { warn } from '@ember/debug';

export default class OfferPanelsComponent extends Component {
  @service case;
  @service router;

  get isDisabledEdit() {
    return this.args.model.isMasteredByAccess || this.case.current.order != null;
  }

  get isEnabledDelete() {
    return !this.args.model.isMasteredByAccess && this.case.current.order == null;
  }

  get hasMixedVatRates() {
    return this.args.model.offerlines.mapBy('vatRate').uniqBy('code').length > 1;
  }

  @task
  *delete() {
    try {
      yield all(this.offerlines.map((t) => t.destroyRecord()));
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
