import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  configuration: service(),

  model: null,

  actions: {
    addTelephone() {
      this.model.then(telephones => {
        const order = telephones.length ? Math.max(...telephones.map(t => t.order)) + 1 : 1;
        const telephoneType = this.configuration.defaultTelephoneType();
        const country = this.configuration.defaultCountry();
        const telephone = this.store.createRecord('telephone', {
          order: order,
          telephoneType: telephoneType,
          country: country
        });
        telephones.pushObject(telephone);
        telephone.save();
      });
    },
    async updateTelephone(oldTelephone, newTelephone) {
      await this.model.then(async (telephones) => {
        telephones.removeObject(oldTelephone);
        telephones.pushObject(newTelephone);
      });
    },
    async removeTelephone(telephone) {
      await this.model.then(async (telephones) => {
        // removal of the data record happens in the telephone-edit-form-line component
        telephones.removeObject(telephone);
      });
    }
  }
});
