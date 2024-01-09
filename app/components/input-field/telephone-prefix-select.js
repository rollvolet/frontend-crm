import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class TelephonePrefixSelect extends Component {
  @service store;

  @tracked options = [];

  constructor() {
    super(...arguments);
    this.options = this.store.peekAll('country');
  }
}
