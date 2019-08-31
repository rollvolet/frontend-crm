import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { proxyAware } from '../../utils/proxy-aware';

export default Component.extend({
  store: service(),

  selected: proxyAware('value'),

  init() {
    this._super(...arguments);
    const submissionTypes = this.store.peekAll('submission-type');
    this.set('options', submissionTypes);
  },

  label: 'Verzendmethode',
  value: null,
  onSelectionChange: null
});
