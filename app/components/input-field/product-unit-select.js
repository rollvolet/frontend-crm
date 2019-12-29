import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { proxyAware } from '../../utils/proxy-aware';

@classic
export default class ProductUnitSelect extends Component {
  @service
  store;

  @proxyAware('value')
  selected;

  init() {
    super.init(...arguments);
    const units = this.store.peekAll('product-unit');
    this.set('options', units);
  }

  label = 'Eenheid';
  value = null;
  errors = null;
  required = false;
  onSelectionChange = null;
}
