import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class PaymentSelect extends Component {
  @service store

  @tracked options = []

  constructor() {
    super(...arguments);
    this.options = this.store.peekAll('payment');
  }

  get label() {
    return this.args.label || 'Bank';
  }

  get required() {
    return this.args.required || false;
  }

  get placeholder() {
    return this.required ? `${this.label} *` : this.label;
  }
}
