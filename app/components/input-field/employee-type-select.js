import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import { compare } from '@ember/utils';
import constants from '../../config/constants';

const { CONCEPT_SCHEMES } = constants;

export default class InputFieldEmployeeTypeSelectComponent extends Component {
  @service store;

  @tracked options = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.options = yield this.store.queryAll('concept', {
      'filter[concept-schemes][:uri:]': CONCEPT_SCHEMES.EMPLOYEE_TYPES,
      sort: 'label',
    });
  }

  get required() {
    return this.args.required || false;
  }

  get placeholder() {
    return this.required && this.args.label ? `${this.args.label} *` : this.args.label;
  }

  get sortedOptions() {
    return this.options.slice(0).sort((a, b) => compare(a.label, b.label));
  }

  @action
  updateValue(option, isChecked) {
    const values = this.args.value.slice(0);
    if (isChecked && !values.includes(option)) {
      values.push(option);
    } else if (!isChecked && values.includes(option)) {
      const i = values.indexOf(option);
      values.splice(i, 1);
    }
    this.args.onSelectionChange(values);
  }
}
