import classic from 'ember-classic-decorator';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { proxyAware } from '../../utils/proxy-aware';

@classic
export default class VatRateSelect extends Component {
  @service
  store;

  @proxyAware('value')
  selected;

  init() {
    super.init(...arguments);
    const vatRates = this.store.peekAll('vat-rate');
    this.set('options', vatRates);
  }

  label = 'BTW tarief';
  value = null;
  errors = null;
  required = false;
  onSelectionChange = null;

  @computed('label', 'required')
  get placeholder() {
    return this.required ? `${this.label} *` : this.label;
  }
}
