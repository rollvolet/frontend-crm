import Service, { service } from '@ember/service';
import { warn } from '@ember/debug';
import { all, dropTask } from 'ember-concurrency';
import constants from '../config/constants';
import { PAGE_SIZE } from '../config';

const {
  COUNTRIES,
  CONCEPT_SCHEMES,
  LANGUAGES,
  TELEPHONE_TYPES,
  DELIVERY_METHODS,
  WAY_OF_ENTRIES,
  VAT_RATES,
} = constants;

export default class CodelistService extends Service {
  @service store;

  @dropTask
  *load() {
    const entities = [
      { type: 'country', sort: 'name' },
      { type: 'telephone-type', sort: 'label' },
      { type: 'language', sort: 'name' },
      { type: 'postal-code', sort: 'name' },
      { type: 'vat-rate', sort: 'position' },
      { type: 'employee', sort: 'first-name' },
    ];
    const conceptSchemes = [
      CONCEPT_SCHEMES.HONORIFIC_PREFIXES,
      CONCEPT_SCHEMES.WAY_OF_ENTRIES,
      CONCEPT_SCHEMES.DELIVERY_METHODS,
      CONCEPT_SCHEMES.EMPLOYEE_TYPES,
    ];
    yield all([
      ...entities.map(({ type, sort }) => {
        return this.store.queryAll(type, {
          'page[size]': PAGE_SIZE.CODELISTS,
          sort,
        });
      }),
      ...conceptSchemes.map((conceptScheme) => {
        return this.store.queryAll('concept', {
          'filter[concept-schemes][:uri:]': conceptScheme,
          sort: 'position',
          'page[size]': PAGE_SIZE.CODELISTS,
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

  get defaultWayOfEntry() {
    const value = this.store.peekAll('concept').find((c) => c.uri == WAY_OF_ENTRIES.TELEPHONE);
    warn('No default way of entry Telephone found', value != null, { id: 'no-default-value' });
    return value;
  }

  get defaultVatRate() {
    const value = this.store.peekAll('vat-rate').find((c) => c.uri == VAT_RATES.PCT_21);
    warn('No default VAT rate 21% found', value != null, { id: 'no-default-value' });
    return value;
  }

  get defaultDeliveryMethod() {
    const value = this.store
      .peekAll('concept')
      .find((c) => c.uri == DELIVERY_METHODS.TO_BE_INSTALLED);
    warn("No default delivery method 'Te plaatsen' found", value != null, {
      id: 'no-default-value',
    });
    return value;
  }

  get defaultVisitor() {
    const value = this.store.peekAll('employee').find((c) => c.fullName == 'Joris Pauwels');
    warn("No default employee 'Joris Pauwels' found", value != null, { id: 'no-default-value' });
    return value;
  }
}
