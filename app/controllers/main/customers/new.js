import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task, all } from 'ember-concurrency';

export default Controller.extend({
  store: service(),
  paperToaster: service(),
  validation: service(),

  validate() {
    const tels = this.telephones.filter(t => !t.isBlank);

    return this.validation.required(this.model.name, 'Naam')
      && this.validation.required(this.country, 'Land')
      && this.validation.required(this.language, 'Taal')
      && this.validation.all(tels, t => this.validation.required(t.get('telephoneType.id'), 'Type van telefoon'))
      && this.validation.all(tels, t => this.validation.required(t.get('country.id'), 'Landcode van telefoon'))
      && this.validation.all(tels, t => this.validation.required(t.area, 'Telefoonzone'))
      && this.validation.all(tels, t => this.validation.onlyNumbers(t.area, 'Telefoonzone'))
      && this.validation.all(tels, t => this.validation.required(t.number, 'Telefoonnummer'))
      && this.validation.all(tels, t => this.validation.onlyNumbers(t.number, 'Telefoonnummer'));
  },
  rollback: task(function * () {
    yield all(this.telephones.map(t => t.destroyRecord()));
    yield this.model.destroyRecord();
    this.transitionToRoute('main.customers.index');
  }),
  saveTelephone: task(function * (telephone) {
    try {
      yield telephone.save();
    } catch (e) {
      warn(`Error while saving new telephone`, { id: 'save.error' });
      throw e;
    }
  }),
  save: task(function * () {
    if (this.validate()) {
      this.set('model.country', this.country);
      this.set('model.language', this.language);
      this.set('model.honorificPrefix', this.honorificPrefix);

      try {
        const customer = yield this.model.save();
        yield all(this.telephones.filter(tel => !tel.isBlank).map(tel => {
          tel.set('customer', customer);
          return this.saveTelephone.perform(tel);
        }));
        this.transitionToRoute('main.customers.edit', customer.id);
      } catch (e) {
        warn(`Error while saving new customer`, { id: 'save.error' });
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
    }
  }
});
