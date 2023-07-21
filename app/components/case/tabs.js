import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { cancelCase, reopenCase } from '../../utils/case-helpers';

export default class CaseTabsComponent extends Component {
  @service router;

  get currentStep() {
    if (this.args.model.invoice.get('id')) {
      return 'invoice';
    } else if (this.args.model.intervention.get('id')) {
      return 'intervention';
    } else if (this.args.model.order.get('id')) {
      return 'order';
    } else if (this.args.model.offer.get('id')) {
      return 'offer';
    } else {
      return 'request';
    }
  }

  get selectedStep() {
    const route = this.router.currentRoute.name.substr('main.case.'.length); // e.g. main.case.request.edit
    if (route.includes('deposit-invoices')) {
      return 'deposit-invoices';
    } else {
      return route.substr(0, route.indexOf('.'));
    }
  }

  @action
  async cancelCase() {
    await cancelCase(this.args.model);
  }

  @action
  async reopenCase() {
    await reopenCase(this.args.model);
  }
}
