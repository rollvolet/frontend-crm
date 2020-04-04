import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class LanguageSelect extends Component {
  @service store

  @tracked options = []

  constructor() {
    super(...arguments);
    this.options = this.store.peekAll('country');
  }

  get label() {
    return this.args.label || 'Land';
  }

  get required() {
    return this.args.required || false;
  }

  get placeholder() {
    return this.required ? `${this.label} *` : this.label;
  }
}
