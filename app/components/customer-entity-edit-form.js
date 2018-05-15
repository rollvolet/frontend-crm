import { A } from '@ember/array';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task, all } from 'ember-concurrency';
import { equal } from '@ember/object/computed';

const onlyDigits = /\D/g; // \D matches all non-digit characters

export default Component.extend({
  store: service(),
  paperToaster: service(),
  validation: service(),

  async init() {
    this._super(...arguments);

    const telephones = await this.model.get('telephones');
    const telephone = this.store.createRecord('telephone', {});
    telephones.pushObject(telephone);

    this.set('telephonesToRemove', A());
  },

  model: null,
  onRollback: null,
  onSave: null,

  scope: 'customer', // one of 'customer', 'contact', 'building'
  isScopeCustomer: equal('scope', 'customer'),

  validate() {
    const tels = this.get('model.telephones').filter(t => !t.isBlank);
    tels.forEach(t => t.set('number', t.number.replace(onlyDigits, '')));

    if (this.model.changedAttributes()['vatNumber']) {
      // vatNumber has changed using an input mask. We need to add the country prefix again
      const vatNumber = this.get('model.vatNumber');
      this.set('model.vatNumber', `BE${vatNumber}`);
    }

    return this.validation.required(this.model.name, 'Naam')
      && this.validation.required(this.model.country, 'Land')
      && this.validation.required(this.model.language, 'Taal')
      && this.validation.vatNumber(this.model.vatNumber, 'BTW nummer')
      && this.validation.all(tels, t => this.validation.required(t.get('telephoneType.id'), 'Type van telefoon'))
      && this.validation.all(tels, t => this.validation.required(t.get('country.id'), 'Landcode van telefoon'))
      && this.validation.all(tels, t => this.validation.required(t.area, 'Telefoonzone'))
      && this.validation.all(tels, t => this.validation.onlyNumbers(t.area, 'Telefoonzone'))
      && this.validation.all(tels, t => this.validation.length(t.area, 'Telefoonzone', 2, 4))
      && this.validation.all(tels, t => this.validation.required(t.number, 'Telefoonnummer'))
      && this.validation.all(tels, t => this.validation.onlyNumbers(t.number, 'Telefoonnummer'))
      && this.validation.all(tels, t => this.validation.minLength(t.number, 'Telefoonnummer', 6));
  },
  rollback: task(function * () {
    const telephones = this.get('model.telephones');
    if (this.model.isNew) {
      yield all(telephones.map(t => t.destroyRecord()));
    } else {
      // A best effort to rollback, but telephones that are already saved won't be rollbacked
      yield all(telephones.filter(t => t.isNew).map(t => t.destroyRecord()));
      yield all(this.get('telephonesToRemove').filter(t => t.isNew).map(t => t.destroyRecord()));
      this.get('telephonesToRemove').filter(t => !t.isNew).forEach(t => telephones.pushObject(t));
      yield all(telephones.filter(t => !t.isNew).map(t => t.rollbackAttributes()));
    }
    this.model.rollbackAttributes();
    this.onRollback();
  }),
  saveTelephone: task(function * (telephone) {
    try {
      if (telephone.isNew && !telephone.isBlank) {
        telephone.set(this.scope, this.model);
        yield telephone.save();
      } else if (!telephone.isBlank && (telephone.hasDirtyAttributes || telephone.hasDirtyRelations())) {
        // cannot patch phone. Create new and remove old phone.
        const newTelephone = this.store.createRecord('telephone', {
          area: telephone.area,
          number: telephone.number,
          memo: telephone.memo,
          order: telephone.order,
          country: telephone.country,
          telephoneType: telephone.telephoneType
        });
        newTelephone.set(this.scope, this.model);
        yield telephone.destroyRecord();
        // TODO: Fix this hack when Ember Data allows creation of already deleted ID
        // See https://github.com/emberjs/data/issues/4972
        //  and https://github.com/emberjs/data/issues/5006
        this.store._removeFromIdMap(telephone._internalModel);
        yield newTelephone.save();
      } else if (telephone.isBlank) {
        yield telephone.destroyRecord();
      }
    } catch (e) {
      warn(`Error while saving new telephone: ${e.message}`, { id: 'save.error' });
      telephone.rollbackAttributes();
      throw e;
    }
  }),
  save: task(function * () {
    if (this.validate()) {
      try {
        const customer = yield this.model.save();
        yield all(this.get('model.telephones').map(tel => this.saveTelephone.perform(tel)));
        yield all(this.get('telephonesToRemove').map(tel => tel.destroyRecord()));
        this.onSave(customer);
      } catch (e) {
        warn(`Error while saving ${this.scope}: ${e.message}`, { id: 'save.error' });
        yield this.rollback.perform();
        this.paperToaster.show('Er is iets misgelopen bij het opslaan.');
      }
    }
  }),

  actions: {
    addTelephone() {
      const telephone = this.store.createRecord('telephone', {});
      this.get('model.telephones').pushObject(telephone);
    },
    removeTelephone(phone) {
      this.get('model.telephones').removeObject(phone);
      this.get('telephonesToRemove').pushObject(phone);
      phone.deleteRecord();

      if (this.get('model.telephones').length == 0) {
        const telephone = this.store.createRecord('telephone', {});
        this.get('model.telephones').pushObject(telephone);
      }
    },
    setPostalCode(code, city) {
      this.model.set('postalCode', code);
      this.model.set('city', city);
    }
  }

});
