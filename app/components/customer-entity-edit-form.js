import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { warn } from '@ember/debug';
import { equal } from '@ember/object/computed';

export default Component.extend({
  model: null,
  onClose: null,

  scope: 'customer', // one of 'customer', 'contact', 'building'
  isScopeCustomer: equal('scope', 'customer'),

  remove: task(function * () {
    // TODO remove telephones
    try {
      yield this.model.destroyRecord();
    } catch (e) {
      warn(`Something went wrong while destroying ${this.scope} ${this.model.id}`, { id: 'destroy-failure' });
    } finally {
      this.onClose();
    }
  }),
  save: task(function * () {
    yield this.model.save();
  }).keepLatest(),

  actions: {
    setPostalCode(code, city) {
      this.model.set('postalCode', code);
      this.model.set('city', city);
    }
  }
});
