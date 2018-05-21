import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import { computed } from '@ember/object';

export default Component.extend({
  store: service(),
  configuration: service(),

  model: null,
  scope: 'customer', // one of 'customer', 'contact', 'building',
  failedUpdates: null,

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
    async updateTelephone(oldTelephone, newTelephone) {
      await this.model.then(async (telephones) => {
        this.failedUpdates.removeObject(oldTelephone.get('id'));
        telephones.removeObject(oldTelephone);
        telephones.pushObject(newTelephone);
      });
    },
    async removeTelephone(telephone) {
      await this.model.then(async (telephones) => {
        // removal of the data record happens in the telephone-edit-form-line component
        this.failedUpdates.removeObject(telephone.get('id'));
        telephones.removeObject(telephone);
      });
    },
    addFailedUpdate(telephone) {
      const id = telephone.get('id');
      if (id && !this.failedUpdates.includes(id))
        this.failedUpdates.pushObject(id);
    }
  }
});
