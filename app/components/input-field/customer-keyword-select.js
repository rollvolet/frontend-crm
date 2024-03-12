import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import constants from '../../config/constants';

const { CONCEPT_SCHEMES } = constants;

export default class CustomerKeywordSelect extends Component {
  @service store;

  @cached
  get options() {
    return new TrackedAsyncData(
      this.store.queryAll('concept', {
        'filter[concept-schemes][:uri:]': CONCEPT_SCHEMES.CUSTOMER_KEYWORDS,
        sort: 'label',
      })
    );
  }

  get selectedValue() {
    if (Array.isArray(this.args.value)) {
      return this.args.value.map((val) => this.lookupRecord(val));
    } else {
      return this.lookupRecord(this.args.value);
    }
  }

  get required() {
    return this.args.required || false;
  }

  get allowClear() {
    return this.args.allowClear !== false; // default to true
  }

  get placeholder() {
    return this.required && this.args.label ? `${this.args.label} *` : this.args.label;
  }

  lookupRecord(value) {
    if (typeof value == 'string') {
      // We assume the label is passed as value.
      // We need to lookup the corresponding Ember Data record in the list of options
      return this.options.isResolved && this.options.value.find((opt) => opt.label == value);
    } else {
      // The value is already an Ember Data record
      return value;
    }
  }
}
