import Component from '@glimmer/component';

const caseSteps = ['request', 'intervention', 'offer', 'order', 'deposit-invoices', 'invoice'];

export default class CaseTabsStepIconComponent extends Component {
  get isCurrent() {
    return this.args.current == this.args.reference;
  }

  get isFinished() {
    const currentIndex = caseSteps.indexOf(this.args.current);
    const refIndex = caseSteps.indexOf(this.args.reference);

    return refIndex < currentIndex;
  }

  get isNext() {
    if (this.args.current == 'request') {
      return this.args.reference == 'offer';
    } else if (this.args.current == 'offer') {
      return this.args.reference == 'order';
    } else if (this.args.current == 'intervention' || this.args.current == 'order') {
      return this.args.reference == 'invoice';
    } else {
      return false;
    }
  }

  get isFuture() {
    const currentIndex = caseSteps.indexOf(this.args.current);
    const refIndex = caseSteps.indexOf(this.args.reference);

    return currentIndex < refIndex;
  }
}
