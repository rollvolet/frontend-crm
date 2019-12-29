import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { proxyAware } from '../../utils/proxy-aware';

@classic
export default class PaymentSelect extends Component {
  @service
  store;

  @proxyAware('value')
  selected;

  init() {
    super.init(...arguments);
    const payments = this.store.peekAll('payment');
    this.set('options', payments);
  }

  label = 'Bank';
  value = null;
  onSelectionChange = null;
}
