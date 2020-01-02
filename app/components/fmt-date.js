import Component from '@glimmer/component';

export default class FmtDateComponent extends Component {
  get fallback() {
    return this.args.fallback || '-';
  }
}
