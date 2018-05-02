import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';

export default Controller.extend({
  store: service(),
  paperToaster: service(),
  validation: service(),
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
      if (this.validation.required(this.country, 'Land')
          && this.validation.required(this.language, 'Taal')) {

        this.set('model.country', this.country);
        this.set('model.language', this.language);
        this.set('model.honorificPrefix', this.honorificPrefix);

        try {
          const customer = await this.model.save();
          // save phones and add to model
          this.transitionToRoute('main.customers.edit', customer.get('id'));
        } catch (e) {
          warn(`Error while saving new customer: ${this.model.adapterError.message}`, { id: 'save.error' });
          this.paperToaster.show('Er is iets misgelopen bij het opslaan.');
        }
      }
    },
    cancel() {
      this.get('telephones').forEach(t => t.destroyRecord());
      // destroy related records
      this.get('model').destroyRecord();
      this.transitionToRoute('main.customers.index');
    }
  }
});
