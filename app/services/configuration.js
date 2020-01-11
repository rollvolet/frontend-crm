import classic from 'ember-classic-decorator';
import Service, { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task, all } from 'ember-concurrency';

@classic
export default class ConfigurationService extends Service {
  @service
  store;

  @(task(function * () {
    const entities = [
      'country',
      'honorific-prefix',
      'language',
      'postal-code',
      'telephone-type',
      'vat-rate',
      'way-of-entry',
      'employee',
      'payment',
      'product-unit'
    ];
    yield all(entities.map(e => this.store.findAll(e)));
  }).drop())
  preloadStaticLists;

  defaultLanguage() {
    const value = this.store.peekAll('language').find(l => l.code == 'NED');
    warn("No default language with code 'NED' found", value != null, { id: 'no-default-value' });
    return value;
  }

  defaultCountry() {
    const value = this.store.peekAll('country').find(c => c.code == 'BE');
    warn("No default country with code 'BE' found", value != null, { id: 'no-default-value' });
    return value;
  }

  defaultTelephoneType() {
    const value = this.store.peekAll('telephoneType').find(t => t.name == 'TEL');
    warn("No default telephone type with name 'TEL' found", value != null, { id: 'no-default-value' });
    return value;
  }
}
