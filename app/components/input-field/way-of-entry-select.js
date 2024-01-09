import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import constants from '../../config/constants';

const { CONCEPT_SCHEMES } = constants;

export default class InputFieldWayOfEntrySelectComponent extends Component {
  @service store;

  @tracked options = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.options = yield this.store.queryAll('concept', {
      'filter[concept-schemes][:uri:]': CONCEPT_SCHEMES.WAY_OF_ENTRIES,
      sort: 'position',
    });
  }

  get required() {
    return this.args.required || false;
  }

  get placeholder() {
    return this.required && this.args.label ? `${this.args.label} *` : this.args.label;
  }

  get sortedOptions() {
    return this.options.sortBy('position');
  }
}
