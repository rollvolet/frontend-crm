import Component from '@glimmer/component';
import { isNone } from '@ember/utils';

export default class LoadingSpinnerComponent extends Component {
  get label() {
    return isNone(this.args.label) ? 'Aan het laden...' : this.args.label;
  }
}
