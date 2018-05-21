import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { warn } from '@ember/debug';
import { equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  configuration: service(),

  model: null,
  onClose: null,

  scope: 'customer', // one of 'customer', 'contact', 'building'
  isScopeCustomer: equal('scope', 'customer'),

  remove: task(function * () {
    // TODO remove telephones
    try {
      yield this.model.destroyRecord();
    } catch (e) {
      warn(`Something went wrong while destroying customer ${this.model.id}`, { id: 'destroy-failure' });
    } finally {
      this.onClose();
    }
  }),
  save: task(function * () {
    yield this.model.save();
  }).keepLatest(),

  actions: {
    addTelephone() {
      this.model.telephones.then(telephones => {
        const order = telephones.length ? Math.max(...telephones.map(t => t.order)) + 1 : 1;
        const telephoneType = this.configuration.defaultTelephoneType();
        const country = this.configuration.defaultCountry();
        const telephone = this.store.createRecord('telephone', {
          order: order,
          telephoneType: telephoneType,
          country: country
        });
        telephone.set(this.scope, this.model);
        telephones.pushObject(telephone);
        telephone.save();
      });
    },
    removeTelephone(telephone) {
      this.model.telephones.then(telephones => {
        // removal of the data record happens in the telephone-edit-form-line component
        telephones.removeObject(telephone);
      });
    },
    setPostalCode(code, city) {
      this.model.set('postalCode', code);
      this.model.set('city', city);
    }
  }
});
