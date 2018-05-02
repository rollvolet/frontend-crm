import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  init() {
    this._super(...arguments);
    this.get('store').findAll('country').then(countries => this.set('options', countries));
  },
  label: 'Land',
  value: null
});
