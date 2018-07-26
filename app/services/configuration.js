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
      'employee',
      'payment'
    ];
    return all(entities.map(e => this.store.findAll(e)));
  },
  defaultLanguage() {
    const value = this.store.peekAll('language').find(l => l.code == 'NED');
    warn("No default language with code 'NED' found", value != null, { id: 'no-default-value' });
    return value;
  },
  defaultCountry() {
    const value = this.store.peekAll('country').find(c => c.code == 'BE');
    warn("No default country with code 'BE' found", value != null, { id: 'no-default-value' });
    return value;
  },
  defaultTelephoneType() {
    const value = this.store.peekAll('telephoneType').find(t => t.name == 'TEL');
    warn("No default telephone type with name 'TEL' found", value != null, { id: 'no-default-value' });
    return value;
  }
});
