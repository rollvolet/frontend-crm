import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import { A } from '@ember/array';
import { warn } from '@ember/debug';

export default Controller.extend({
  store: service(),
  init() {
    this._super(...arguments);

    this.get('store').findAll('language').then(languages => {
      const defaultLanguage = languages.find(l => l.get('code') == 'NED');
      this.set('language', defaultLanguage);
      this.set('languages', languages);
    });
    this.get('store').findAll('honorific-prefix').then(prefixes => this.set('honorificPrefixes', prefixes));
    this.get('store').findAll('country').then(countries => {
      const defaultCountry = countries.find(c => c.get('code') == 'BE');
      this.set('country', defaultCountry);
      this.set('countries', countries);
    });
    this.get('store').findAll('telephone-type').then(types => this.set('telephoneTypes', types));
    this.get('store').findAll('postal-code').then(postalCodes => this.set('postalCodes', postalCodes));
  },
  honorificPrefixesByLanguage: computed('honorificPrefixes', 'honorificPrefixes.[]', 'language', function() {
    if (this.get('honorificPrefixes') && this.get('language')) {
      return this.get('honorificPrefixes').filter(p => {
        return p.get('id').endsWith(`-${this.get('language.id')}`) && p.get('name');
      });
    } else {
      return this.get('honorificPrefixes');
    }
  }),
  languageChanged: observer('language', function() {
    if (this.get('honorificPrefix')) {
      const composedId = this.get('honorificPrefix.id');
      const prefixId = composedId.substring(0, composedId.indexOf('-'));
      const honorificPrefix = this.get('honorificPrefixes').find(p => {
        return p.get('id') == `${prefixId}-${this.get('language.id')}`;
      });
      this.set('honorificPrefix', honorificPrefix);
    }
  }),
  addressChanged: observer('address', function() {
    const lines = (this.get('address') || '').split('\n');
    if (lines.length > 3)
      warn('Only 3 lines are allowed in the address text area', { id: 'to-many-address-lines' });
    let i = 0;
    while(i < 3) {
      this.set(`model.address${i + 1}`, lines[i] || undefined);
      i++;
    }
  }),
  addressErrors: computed('address', function() {
    const errors = A();
    const lines = (this.get('address') || '').split('\n');
    if (lines.length > 3)
      errors.pushObject("Adres mag maximaal 3 lijnen bevatten");
    return errors;
  }),
  actions: {
    addTelephone() {
      const telephone = this.get('store').createRecord('telephone', {});
      this.get('telephones').pushObject(telephone);
    },
    removeTelephone(phone) {
      this.get('telephones').removeObject(phone);
      phone.destroyRecord();

      if (this.get('telephones').length == 0) {
        const telephone = this.get('store').createRecord('telephone', {});
        this.get('telephones').pushObject(telephone);
      }
    },
    selectPostalCode(postalCode) {
      this.set('postalCode', postalCode);
      this.set('model.postalCode', postalCode ? postalCode.get('code') : undefined);
      this.set('model.city', postalCode ? postalCode.get('name') : undefined);
    },
    async save() {
      // TODO country / language are required
      this.set('model.country', this.get('country'));
      this.set('model.language', this.get('language'));
      this.set('model.honorificPrefix', this.get('honorificPrefix'));
      const customer = await this.get('model').save();
      // save phones and add to model
      this.transitionToRoute('main.customers.edit', customer.get('id'));
    },
    cancel() {
      this.get('telephones').forEach(t => t.destroyRecord());
      // destroy related records
      this.get('model').destroyRecord();
      this.transitionToRoute('main.customers.index');
    }
  }
});
