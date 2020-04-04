import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class TelephoneTypeSelect extends Component {
  @service store

  @tracked options = []

  constructor() {
    super(...arguments);
    const types = this.store.peekAll('telephone-type');
    this.options = types.filter(t => ['TEL', 'FAX'].includes(t.name));
  }

  get label() {
    return this.args.label || 'Type';
  }

  get required() {
    return this.args.required || false;
  }

  get placeholder() {
    return this.required ? `${this.label} *` : this.label;
  }
}
