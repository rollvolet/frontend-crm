import classic from 'ember-classic-decorator';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { proxyAware } from '../../utils/proxy-aware';

@classic
export default class LanguageSelect extends Component {
  @service store

  @proxyAware('value')
  selected

  init() {
    super.init(...arguments);
    const languages = this.store.peekAll('language');
    this.set('options', languages);
  }

  label = 'Taal';
  value = null;
  errors = null;
  required = false;
  onSelectionChange = null;

  @computed('label', 'required')
  get placeholder() {
    return this.required ? `${this.label} *` : this.label;
  }
}
