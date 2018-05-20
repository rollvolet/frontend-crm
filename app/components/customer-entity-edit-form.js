import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { warn } from '@ember/debug';
import { equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),

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
        const order = Math.max(...telephones.map(t => t.order)) + 1;
        const telephone = this.store.createRecord('telephone', { order: order });
        // TODO set default telephone-type and country
        telephone.set(this.scope, this.model);
        telephones.pushObject(telephone);
        telephone.save();
      });
    },
    setPostalCode(code, city) {
      this.model.set('postalCode', code);
      this.model.set('city', city);
    }
  }
});
