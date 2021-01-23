import Component from '@glimmer/component';

export default class LoadingSpinnerComponent extends Component {
  get label() {
    return this.args.label || 'Aan het laden...';
  }
}
