import { computed } from '@ember/object';
import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { warn } from '@ember/debug';
import { equal } from '@ember/object/computed';

const digitsOnly = /\D/g;

export default Component.extend({
  model: null,
  onClose: null,
  onRemove: null,

  scope: 'customer', // one of 'customer', 'contact', 'building'
  isScopeCustomer: equal('scope', 'customer'),
  showWarningOnLeaveDialog: false,

  hasFailedTelephone: computed('model.telephones.[]', function() {
    return this.model.telephones.find(t => t.isNew || t.validations.isInvalid || t.isError) != null;
  }),

  formattedVatNumber: computed('model.vatNumber', {
    get() {
      const vatNumber = this.model.vatNumber;

      if (vatNumber) {
        if (vatNumber.length >= 2) {
          const country = vatNumber.substr(0, 2).toUpperCase();
          let number = vatNumber.substr(2);

          if (country == 'BE') {
            if (!number.startsWith('0'))
              number = `0${number}`;

            if (number.length >= 4)
              number = `${number.substr(0,4)}.${number.substr(4)}`;

            if (number.length >= 8)
              number = `${number.substr(0,8)}.${number.substr(8)}`;
          }

          return `${country} ${number}`;
        } else {
          return vatNumber.toUpperCase();
        }
      } else {
        return null;
      }
    },
    set(key, value) {
      return value;
    }
  }),

  remove: task(function * () {
    try {
      yield all(this.model.telephones.map(t => t.destroyRecord()));
      // TODO remove contacts/buildings ?
      yield this.model.destroyRecord();
    } catch (e) {
      warn(`Something went wrong while destroying ${this.scope} ${this.model.id}`, { id: 'destroy-failure' });
    } finally {
      this.onRemove();
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
    const { validations } = yield this.model.validate();
    if (validations.isValid)
      yield this.model.save();
  }).keepLatest(),

  actions: {
    close() {
      if (this.model.isNew || this.model.validations.isInvalid || this.model.isError
          || (this.save.last && this.save.last.isError)
          || this.hasFailedTelephone) {
        this.set('showUnsavedChangesDialog', true);
      } else {
        this.onClose();
      }
    },
    confirmClose() {
      this.rollbackTree.perform();
      this.onClose();
    },
    setPostalCode(code, city) {
      this.model.set('postalCode', code);
      this.model.set('city', city);
    },
    setIsCompany(isCompany) {
      if (!isCompany)
        this.model.set('vatNumber', null);
      else
        this.set('formattedVatNumber', 'BE 0');

      this.model.set('isCompany', isCompany);
      this.save.perform();
    },
    setVatNumber(formattedVatNumber) {
      let vatNumber = formattedVatNumber;

      if (formattedVatNumber && formattedVatNumber.length >= 2) {
        const country = formattedVatNumber.substr(0, 2);
        const formattedNumber = formattedVatNumber.substr(2);
        const number = formattedNumber.replace(digitsOnly, '');
        vatNumber = `${country}${number}`;
      }

      this.model.set('vatNumber', vatNumber);
    }
  }
});
