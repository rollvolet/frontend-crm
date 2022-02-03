import Service, { inject as service } from '@ember/service';
import { debug, warn } from '@ember/debug';
import { all, dropTask } from 'ember-concurrency';

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
    const value = this.store.peekAll('country').find((c) => c.code == 'BE');
    warn("No default country with code 'BE' found", value != null, { id: 'no-default-value' });
    return value;
  }
}
