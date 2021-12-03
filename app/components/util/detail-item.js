import Component from '@glimmer/component';

export default class DetailListItem extends Component {
  get displayRow() {
    return this.args.displayRow || false;
  }

  get width() {
    return this.args.width || 32;
  }
}
