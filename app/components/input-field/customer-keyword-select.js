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

  get required() {
    return this.args.required || false;
  }

  get allowClear() {
    return this.args.allowClear !== false; // default to true
  }

  get placeholder() {
    return this.required && this.args.label ? `${this.args.label} *` : this.args.label;
  }
}
