import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OfferDetailEditComponent extends Component {
  @service case

  get request() {
    return this.case.current && this.case.current.request;
  }

  get visitor() {
    return this.case.visitor;
  }

  @action
  setVisitor(visitor) {
    this.request.visitor = visitor ? visitor.firstName : null;
  }

}
