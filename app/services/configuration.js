import Service, { inject as service } from '@ember/service';
import { debug, warn } from '@ember/debug';
import { all, dropTask } from 'ember-concurrency';

const COUNTRY_BE = 'http://data.rollvolet.be/countries/a181ff79-c47a-4cf6-9ed9-6305c02c0440';

export default class ConfigurationService extends Service {
  @service store;

  constructor() {
    super(...arguments);
    debug('Preloading static lists');
    this.preloadStaticLists.perform();
  }

  @dropTask
  *preloadStaticLists() {
    const entities = [
      'country',
      'honorific-prefix',
      'telephone-type',
      'language',
      'postal-code',
      'vat-rate',
      'way-of-entry',
      'employee',
      'payment',
    ];
    yield all(entities.map((e) => this.store.findAll(e)));
  }

  get defaultLanguage() {
    const value = this.store.peekAll('language').find((l) => l.code == 'NED');
    warn("No default language with code 'NED' found", value != null, { id: 'no-default-value' });
    return value;
  }

  get defaultCountry() {
    const value = this.store.peekAll('country').find((c) => c.uri == COUNTRY_BE);
    warn("No default country 'BE' found", value != null, { id: 'no-default-value' });
    return value;
  }

  get defaultTelephoneType() {
    const value = this.store
      .peekAll('telephone-type')
      .find((c) => c.uri == 'http://www.w3.org/2006/vcard/ns#Voice');
    warn('No default telephone-type vcard:Voice found', value != null, { id: 'no-default-value' });
    return value;
  }
}
