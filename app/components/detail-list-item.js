import Component from '@glimmer/component';

export default class DetailListItem extends Component {
  get displayRow() {
    return this.args.displayRow || false;
  }
}
