import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class WayOfEntrySelect extends Component {
  @service store

  @tracked options = []

  constructor() {
    super(...arguments);
    this.options = this.store.peekAll('way-of-entry');
  }

  get label() {
    return this.args.label || 'Aanmelding';
  }

  get required() {
    return this.args.required || false;
  }

  get placeholder() {
    return this.required ? `${this.label} *` : this.label;
  }

  get sortedOptions() {
    return this.options.sortBy('position');
  }
}
