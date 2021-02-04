import Component from '@glimmer/component';

export default class OfferlineListComponent extends Component {
  get sortedOfferlines() {
    return this.args.model.sortBy('sequenceNumber');
  }
}
