import Service, { inject as service } from '@ember/service';
import { all } from 'rsvp';
import { warn } from '@ember/debug';

export default Service.extend({
  store: service(),
  preloadStaticLists() {
    const entities = [
      'country',
      'honorific-prefix',
      'language',
      'postal-code',
      'telephone-type',
      'submission-type',
      'vat-rate',
      'way-of-entry',
      'employee'
    ];
    return all(entities.map(e => this.store.findAll(e)));
  },
  defaultLanguage() {
    const value = this.store.peekAll('language').find(l => l.get('code') == 'NED');
    warn("No default language with code 'NED' found", value != null, { id: 'no-default-value' });
    return value;
  },
  defaultCountry() {
    const value = this.store.peekAll('country').find(c => c.get('code') == 'BE');
    warn("No default country with code 'BE' found", value != null, { id: 'no-default-value' });
    return value;
  }
});
