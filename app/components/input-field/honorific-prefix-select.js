import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { composeId } from '../../models/honorific-prefix';

export default class HonorificPrefixSelect extends Component {
  @service store

  @tracked honorificPrefixes = []

  constructor() {
    super(...arguments);
    this.honorificPrefixes = this.store.peekAll('honorific-prefix');
  }

  get required() {
    return this.args.required || false;
  }

  get placeholder() {
    return this.required ? `${this.args.label} *` : this.args.label;
  }

  get options() {
    if (this.honorificPrefixes && this.args.language.get('id')) {
      return this.honorificPrefixes.filter(p => {
        return p.name && p.languageId == this.args.language.get('id');
      });
    } else {
      return this.honorificPrefixes.filter(p => p.name);
    }
  }

  @action
  updateSelection() {
    if (this.args.value.get('entityId') && this.args.language.get('id')
        && this.args.value.get('languageId') != this.args.language.get('id')) {
      // the language changed while a prefix has already been selected
      const honorificPrefix = this.honorificPrefixes.find(p => {
        // Find same prefix in the new language
        return p.get('id') == composeId(this.args.value.get('entityId'), this.args.language.get('id'));
      });
      this.args.onSelectionChange(honorificPrefix);
    }
  }
}
