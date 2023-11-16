import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class MainCaseController extends Controller {
  @service router;

  get isLinkingCustomer() {
    return [
      'main.case.intervention.edit.customer',
      'main.case.intervention.edit.customer',
    ].includes(this.router.currentRouteName);
  }
}
