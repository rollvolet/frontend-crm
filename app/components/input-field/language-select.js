import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class LanguageSelect extends Component {
  @service store;

  @tracked options = [];

  constructor() {
    super(...arguments);
    this.options = this.store.peekAll('language');
  }

  get required() {
    return this.args.required || false;
  }

  get placeholder() {
    return this.required ? `${this.args.label} *` : this.args.label;
  }
}
