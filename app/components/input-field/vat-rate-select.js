import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { compare } from '@ember/utils';
import constants from '../../config/constants';

const { TAXFREE } = constants.VAT_RATES;

export default class VatRateSelect extends Component {
  @service store;

  @tracked options = [];

  constructor() {
    super(...arguments);
    this.options = this.store
      .peekAll('vat-rate')
      .slice(0)
      .sort((a, b) => compare(a.position, b.position));
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

  get filteredOptions() {
    if (this.args.isB2B) {
      return this.options;
    } else {
      return this.options.filter((opt) => opt.uri != TAXFREE);
    }
  }
}
