import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import applyFilterParams from '../../../../../utils/apply-filter-params';

export default class MainCaseInterventionEditCustomerController extends Controller {
  @service router;
  @service('case') caseService;

  @tracked page = 0;
  @tracked size = 25;
  @tracked sort = 'name';

  case;
  intervention;

  @task
  *linkCustomerToIntervention(customer) {
    this.intervention.customer = customer;
    yield this.intervention.save();
    // TODO set relation instead of URI once relationship to customer is fully defined
    yield this.caseService.current.updateRecord('customer', customer);
    this.router.transitionTo('main.case.intervention.edit.index', this.case, this.intervention);
  }

  @action
  applyFilter(filter) {
    applyFilterParams.bind(this)(filter);
  }

  @action
  previousPage() {
    this.selectPage(this.page - 1);
  }

  @action
  nextPage() {
    this.selectPage(this.page + 1);
  }

  @action
  selectPage(page) {
    this.page = page;
  }
}
