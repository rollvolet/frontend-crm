import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import { A } from '@ember/array';
import { warn } from '@ember/debug';

export default Controller.extend({
  store: service(),
  addressChanged: observer('address', function() {
    const lines = (this.get('address') || '').split('\n');
    if (lines.length > 3)
      warn('Only 3 lines are allowed in the address text area', { id: 'to-many-address-lines' });
    let i = 0;
    while(i < 3) {
      this.set(`model.address${i + 1}`, lines[i] || undefined);
      i++;
    }
  }),
  addressErrors: computed('address', function() {
    const errors = A();
    const lines = (this.get('address') || '').split('\n');
    if (lines.length > 3)
      errors.pushObject("Adres mag maximaal 3 lijnen bevatten");
    return errors;
  }),
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
