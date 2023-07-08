import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import constants from '../../config/constants';

const { CUSTOMER_TYPES } = constants;

export default class CustomerEntityFormComponent extends Component {
  @service store;

  @tracked scope = this.args.scope || 'customer'; // one of 'customer', 'contact', 'building'

  get scopeNoun() {
    if (this.scope == 'contact') {
      return 'het contact';
    } else if (this.scope == 'building') {
      return 'het gebouw';
    } else {
      return 'de klant';
    }
  }

  get isScopeCustomer() {
    return this.scope == 'customer';
  }

  @action
  setCustomerType(event) {
    if (event.target.value == 'company') {
      this.args.model.type = CUSTOMER_TYPES.ORGANIZATION;
    } else {
      this.args.model.type = CUSTOMER_TYPES.INDIVIDUAL;
      this.args.model.vatNumber = null;
    }
  }

  @action
  setLanguage(language) {
    this.args.model.language = language;

    // update honorific prefix to translation (with NL fallback) if language changes
    const currentLabel = this.args.model.honorificPrefix;
    const honorificPrefixRecord = this.store.peekAll('concept').find((concept) => {
      return concept.langLabel.map((l) => l.content).includes(currentLabel);
    });
    if (honorificPrefixRecord) {
      const translations = honorificPrefixRecord.langLabel;
      let translation = translations.find((l) => l.language == language.langTag);
      if (!translation) {
        translation = translations.find((l) => l.language == 'nl');
      }
      this.args.model.honorificPrefix = translation?.content;
    }
  }

  @action
  async setPostalCode(code, city) {
    const address = await this.args.model.address;
    address.postalCode = code;
    address.city = city;
  }
}
