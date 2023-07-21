import Component from '@glimmer/component';

export default class CaseTabsOrderComponent extends Component {
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
}
