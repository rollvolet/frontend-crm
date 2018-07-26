import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { filterBy } from '@ember/object/computed';
import { task } from 'ember-concurrency';

export default Component.extend({
  store: service(),

  model: null,
  show: false,
  onClose: null,
  onCreateNewDeposit: null,
  selectedDeposit: null,

  saveDeposit: task(function * (deposit) {
    const { validations } = yield deposit.validate();
    if (validations.isValid) {
      yield deposit.save();
      this.set('selectedDeposit', null);
    }
  }).keepLatest(),

  actions: {
    async createNewDeposit() {
      const deposit = await this.onCreateNewDeposit();
      this.set('selectedDeposit', deposit);
    },
    deleteDeposit(deposit) {
      this.model.removeObject(deposit);
      deposit.destroyRecord();
    },
    selectDeposit(deposit) {
      if (this.selectedDeposit && this.selectedDeposit.isNew) {
        this.selectedDeposit.destroyRecord();
      }
      this.set('selectedDeposit', deposit);
    },
    close() {
      if (this.selectedDeposit && this.selectedDeposit.isNew) {
        const deposit = this.selectedDeposit;
        this.set('selectedDeposit', null);
        deposit.destroyRecord();
      }
      this.onClose();
    }
  }
});
