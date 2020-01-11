import classic from 'ember-classic-decorator';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { proxyAware } from '../../utils/proxy-aware';

@classic
export default class TelephoneTypeSelect extends Component {
  @service
  store;

  @proxyAware('value')
  selected;

  init() {
    super.init(...arguments);
    const types = this.store.peekAll('telephone-type');
    const supportedTypes = types.filter(t => ['TEL', 'FAX'].includes(t.name));
    this.set('options', supportedTypes);
  }

  label = 'Type';
  value = null;
  onSelectionChange = null;

  @computed('label', 'required')
  get placeholder() {
    return this.required ? `${this.label} *` : this.label;
  }
}
