import { warn } from '@ember/debug';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';

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
  },
  honorificPrefixesByLanguage: computed('honorificPrefixes', 'language', function() {
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
    const lines = this.get('address').split('\n');
    if (lines.length > 3)
      warn('Only 3 lines are allowed in the address text area', { id: 'to-many-address-lines' });
    let i = 0;
    while(i < 3) {
      this.set(`model.address${i + 1}`, lines[i] || undefined);
      i++;
    }
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
    async save() {
      const customer = await this.get('model').save();
      // save phones and add to model
      this.transitionTo('main.customers.edit', customer.get('id'));
    },
    cancel() {
      this.get('telephones').forEach(t => t.destroyRecord());
      // destroy related records
      this.get('model').destroyRecord();
      this.transitionToRoute('main.customers.index');
    }
  }
});