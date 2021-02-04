import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class VatRateSelect extends Component {
  @service store

  @tracked options = []

  constructor() {
    super(...arguments);
    this.options = this.store.peekAll('vat-rate');
  }

  get required() {
    return this.args.required || false;
  }

  get allowClear() {
    return this.args.allowClear !== false; // default to true
  }

  get placeholder() {
    return this.required ? `${this.label} *` : this.label;
  }
}
