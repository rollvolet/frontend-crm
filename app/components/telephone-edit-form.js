import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  configuration: service(),

  model: null,
  scope: 'customer', // one of 'customer', 'contact', 'building'

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
        telephone.set(this.scope, this.model);
        telephones.pushObject(telephone);
        telephone.save();
      });
    },
    removeTelephone(telephone) {
      this.model.then(telephones => {
        // removal of the data record happens in the telephone-edit-form-line component
        telephones.removeObject(telephone);
      });
    }
  }
});
