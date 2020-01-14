import Component from '@glimmer/component';

export default class OfferlinesDetailPanel extends Component {
  get sortedLines() {
    return this.args.model.sortBy('sequenceNumber');
  }
}
