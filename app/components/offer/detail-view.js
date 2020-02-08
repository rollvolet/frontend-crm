import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class OfferDetailViewComponent extends Component {
  @service case

  get request() {
    return this.case.current && this.case.current.request;
  }
}
