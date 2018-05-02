import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';

export default Controller.extend({
  store: service(),
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
      // TODO country / language are required
      this.set('model.country', this.get('country'));
      this.set('model.language', this.get('language'));
      this.set('model.honorificPrefix', this.get('honorificPrefix'));
      const customer = await this.get('model').save();
      // save phones and add to model
      this.transitionToRoute('main.customers.edit', customer.get('id'));
    },
    cancel() {
      this.get('telephones').forEach(t => t.destroyRecord());
      // destroy related records
      this.get('model').destroyRecord();
      this.transitionToRoute('main.customers.index');
    }
  }
});
