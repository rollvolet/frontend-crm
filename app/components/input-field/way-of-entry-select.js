import classic from 'ember-classic-decorator';
import { computed } from '@ember/object';
import { sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { proxyAware } from '../../utils/proxy-aware';

@classic
export default class WayOfEntrySelect extends Component {
  @service store;

  @proxyAware('value')
  selected;

  init() {
    super.init(...arguments);
    const wayOfEntries = this.store.peekAll('way-of-entry');
    this.set('options', wayOfEntries);
  }

  label = 'Aanmelding';
  value = null;
  onSelectionChange = null;

  optionSort = Object.freeze(['position'])
  @sort('options', 'optionSort') sortedOptions
}
