import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { cancelCase, reopenCase } from '../../utils/case-helpers';

export default class CaseTabsComponent extends Component {
  @service router;
  @service store;

  constructor() {
    super(...arguments);

    this.router.on('routeDidChange', () => {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.hasAttribute('data-case-tab')) {
        document.activeElement.blur(); // unfocus tab
      }
    });
  }

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
    return 'request';
    // TODO get selected step based on route info
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
