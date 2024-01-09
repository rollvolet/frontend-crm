import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class VatRateSelect extends Component {
  @service store;

  @tracked options = [];

  constructor() {
    super(...arguments);
    this.options = this.store.peekAll('vat-rate').sortBy('order');
  }

  get required() {
    return this.args.required || false;
  }

  get placeholder() {
    return this.required && this.args.label ? `${this.args.label} *` : this.args.label;
  }

  get allowClear() {
    return this.args.allowClear !== false; // default to true
  }
}
