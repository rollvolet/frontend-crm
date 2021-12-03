import Component from '@glimmer/component';

export default class FmtEmail extends Component {
  get href() {
    return `mailto:${this.args.value}`;
  }
}
