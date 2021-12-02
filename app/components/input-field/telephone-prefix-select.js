import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class TelephonePrefixSelect extends Component {
  @service store;

  @tracked options = [];

  constructor() {
    super(...arguments);
    this.options = this.store.peekAll('country');
  }

  get required() {
    return this.args.required || false;
  }

  get placeholder() {
    return this.required ? `${this.label} *` : this.label;
  }
}
