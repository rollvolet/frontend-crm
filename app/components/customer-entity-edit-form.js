import { computed } from '@ember/object';
import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { warn } from '@ember/debug';
import { equal } from '@ember/object/computed';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';

export default Component.extend({
  validation: service(),

  model: null,
  onClose: null,

  scope: 'customer', // one of 'customer', 'contact', 'building'
  isScopeCustomer: equal('scope', 'customer'),
  showWarningOnLeaveDialog: false,

  init() {
    this._super(...arguments);
    this.set('failedTelephoneUpdates', A());
  },

  hasFailedTelephone: computed('model.telephones.[]', 'failedTelephoneUpdates.[]', function() {
    if (this.model.telephones.find(t => t.isNew || t.isError))
      return true;
    if (this.model.telephones.find(t => this.failedTelephoneUpdates.includes(t.get('id'))))
      return true;
    else
      return false;
  }),

  isValid() {
    return this.validation.required(this.model.get('country.id'), 'Land')
      && this.validation.required(this.model.get('language.id'), 'Taal')
      && this.validation.vatNumber(this.model.vatNumber, 'BTW nummer');
  },

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
  rollbackTree: task( function * () {
    this.model.rollbackAttributes();
    const rollbackPromises = [];
    const telephones = yield this.model.get('telephones');
    telephones.forEach( (telephone) => {
      telephone.rollbackAttributes();
      rollbackPromises.push(telephone.belongsTo('country').reload());
      rollbackPromises.push(telephone.belongsTo('telephoneType').reload());
    });
    rollbackPromises.push(this.model.belongsTo('country').reload());
    rollbackPromises.push(this.model.belongsTo('language').reload());
    rollbackPromises.push(this.model.belongsTo('honorificPrefix').reload());
    yield all(rollbackPromises);
  }),
  save: task(function * () {
    if (!this.isValid())
      throw new Error(`Invalid ${this.scope}`);
    yield this.model.save();
  }).keepLatest(),

  actions: {
    close() {
      if (this.model.isNew || this.model.isError || (this.save.last && this.save.last.isError)
         || this.hasFailedTelephone) {
        this.set('showWarningOnLeaveDialog', true);
      } else {
        this.onClose();
      }
    },
    closeWarningOnLeaveDialog() {
      this.set('showWarningOnLeaveDialog', false);
    },
    confirmedClose() {
      this.rollbackTree.perform();
      this.set('showWarningOnLeaveDialog', false);
      this.onClose();
    },
    setPostalCode(code, city) {
      this.model.set('postalCode', code);
      this.model.set('city', city);
    }
  }
});
