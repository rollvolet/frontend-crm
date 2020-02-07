import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class RequestDetailViewComponent extends Component {
  @service case

  get isLinkedToCustomer() {
    return this.case.current.customer != null;
  }
}
