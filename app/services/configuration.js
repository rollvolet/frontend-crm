import Service, { inject as service } from '@ember/service';
import { debug, warn } from '@ember/debug';
import { all, dropTask } from 'ember-concurrency';
import constants from '../config/constants';

const { COUNTRIES, CONCEPT_SCHEMES, LANGUAGES, TELEPHONE_TYPES } = constants;

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
      'telephone-type',
      'language',
      'postal-code',
      'vat-rate',
      'employee',
    ];
    const conceptSchemes = [CONCEPT_SCHEMES.HONORIFIC_PREFIXES, CONCEPT_SCHEMES.WAY_OF_ENTRIES];
    yield all([
      ...entities.map((type) => {
        this.store.queryAll(type);
      }),
      ...conceptSchemes.map((conceptScheme) => {
        this.store.queryAll('concept', {
          'filter[concept-schemes][:uri:]': conceptScheme,
          sort: 'position',
        });
      }),
    ]);
  }

  get defaultLanguage() {
    const value = this.store.peekAll('language').find((l) => l.uri == LANGUAGES.NL);
    warn("No default language with code 'NED' found", value != null, { id: 'no-default-value' });
    return value;
  }

  get defaultCountry() {
    const value = this.store.peekAll('country').find((c) => c.uri == COUNTRIES.BE);
    warn("No default country 'BE' found", value != null, { id: 'no-default-value' });
    return value;
  }

  get defaultTelephoneType() {
    const value = this.store.peekAll('telephone-type').find((c) => c.uri == TELEPHONE_TYPES.VOICE);
    warn('No default telephone-type vcard:Voice found', value != null, { id: 'no-default-value' });
    return value;
  }

  get defaultVisitor() {
    const value = this.store.peekAll('employee').find((c) => c.fullName == 'Joris Pauwels');
    warn("No default employee 'Joris Pauwels' found", value != null, { id: 'no-default-value' });
    return value;
  }
}
