import Component from '@glimmer/component';

export default class CaseTabsOfferComponent extends Component {
  get isNextStep() {
    return this.args.currentStep == 'request';
  }

  get canCreateNew() {
    return (
      !this.args.model.isCancelled &&
      this.args.model.customer.get('id') &&
      this.args.model.request.get('id') &&
      this.args.model.offer.get('id') == null
    );
  }
}
