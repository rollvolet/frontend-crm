import Component from '@glimmer/component';

export default class FmtDateComponent extends Component {
  get fallback() {
    return this.args.fallback || '-';
  }

  get format() {
    return this.args.format || 'L';
  }
}
