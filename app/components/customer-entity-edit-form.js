import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task, all } from 'ember-concurrency';

export default Component.extend({
  store: service(),
  paperToaster: service(),
  validation: service(),

  async init() {
    this._super(...arguments);

    const telephones = await this.model.get('telephones');
    this.set('telephones', telephones);
    const telephone = this.store.createRecord('telephone', {});
    this.get('telephones').pushObject(telephone);
  },
  validate() {
    const tels = this.telephones.filter(t => !t.isBlank);

    return this.validation.required(this.model.name, 'Naam')
      && this.validation.required(this.model.country, 'Land')
      && this.validation.required(this.model.language, 'Taal')
      && this.validation.all(tels, t => this.validation.required(t.get('telephoneType.id'), 'Type van telefoon'))
      && this.validation.all(tels, t => this.validation.required(t.get('country.id'), 'Landcode van telefoon'))
      && this.validation.all(tels, t => this.validation.required(t.area, 'Telefoonzone'))
      && this.validation.all(tels, t => this.validation.onlyNumbers(t.area, 'Telefoonzone'))
      && this.validation.all(tels, t => this.validation.required(t.number, 'Telefoonnummer'))
      && this.validation.all(tels, t => this.validation.onlyNumbers(t.number, 'Telefoonnummer'));

    // TODO add validation on phone number length
  },
  // Best effort to rollback
  // - remove already persisted phones for a new customer
  // - phone updates on an already persisted customer will not be rollbacked
  rollback: task(function * () {
    if (this.model.isNew)
      yield all(this.telephones.map(t => t.destroyRecord()));
    this.model.rollbackAttributes();
    this.onRollback();
  }),
  saveTelephone: task(function * (telephone) {
    try {
      if (telephone.isNew && !telephone.isBlank) {
        telephone.set(this.scope, this.model);
        yield telephone.save();
      } else if (telephone.hasDirtyAttributes && !telephone.isBlank) {
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
        yield newTelephone.save();
      } else if (telephone.isBlank) {
        telephone.destroyRecord();
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
        yield all(this.telephones.map(tel => this.saveTelephone.perform(tel)));
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
      this.get('telephones').pushObject(telephone);
    },
    removeTelephone(phone) {
      this.get('telephones').removeObject(phone);
      phone.destroyRecord();

      if (this.get('telephones').length == 0) {
        const telephone = this.store.createRecord('telephone', {});
        this.get('telephones').pushObject(telephone);
      }
    },
    setPostalCode(code, city) {
      this.model.set('postalCode', code);
      this.model.set('city', city);
    }
  }

});
