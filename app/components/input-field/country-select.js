import classic from 'ember-classic-decorator';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { proxyAware } from '../../utils/proxy-aware';

@classic
export default class CountrySelect extends Component {
  @service
  store;

  @proxyAware('value')
  selected;

  init() {
    super.init(...arguments);
    const countries = this.store.peekAll('country');
    this.set('options', countries);
  }

  label = 'Land';
  value = null;
  errors = null;
  required = false;
  onSelectionChange = null;

  @computed('label', 'required')
  get placeholder() {
    return this.required ? `${this.label} *` : this.label;
  }
}
