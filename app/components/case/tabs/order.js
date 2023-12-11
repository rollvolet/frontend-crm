import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CaseTabsOrderComponent extends Component {
  @service router;

  @tracked isOpenMissingDeliveryMethodModal = false;

  get isNextStep() {
    return this.args.currentStep == 'offer';
  }

  get canCreateNew() {
    return (
      !this.args.model.isCancelled &&
      this.args.model.offer.get('id') &&
      !this.args.model.offer.get('isMasteredByAccess') &&
      this.args.model.order.get('id') == null
    );
  }

  @action
  async navigateToOrderRoute() {
    const deliveryMethod = await this.args.model.deliveryMethod;
    if (deliveryMethod) {
      const offer = await this.args.model.offer;
      this.router.transitionTo('main.case.offer.edit.order', this.args.model.id, offer.id);
    } else {
      this.isOpenMissingDeliveryMethodModal = true;
    }
  }

  @action
  closeMissingDeliveryMethodModal() {
    this.isOpenMissingDeliveryMethodModal = false;
  }
}
