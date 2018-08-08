import { warn } from '@ember/debug';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import DecimalInputFormatting from '../mixins/decimal-input-formatting';
import { task } from 'ember-concurrency';

export default Component.extend(DecimalInputFormatting, {
  store: service(),
  documentGeneration: service(),

  model: null,
  save: null,
  onContactChange: null,
  onBuildingChange: null,
  hasProductionTicketUploadError: false,

  init() {
    this._super(...arguments);
    this.initDecimalInput('amount');
    this.initDecimalInput('scheduledHours');
    this.initDecimalInput('scheduledNbOfPersons');
    this.initDecimalInput('invoicableHours');
    this.initDecimalInput('invoicableNbOfPersons');
  },

  uploadProductionTicket: task(function * (file) {
    try {
      this.set('hasProductionTicketUploadError', false);
      yield this.documentGeneration.uploadProductionTicket(this.model, file);
    } catch (e) {
      warn(`Error while uploading production ticket: ${e.message || JSON.stringify(e)}`, { id: 'failure.upload' } );
      file.queue.remove(file);
      this.set('hasProductionTicketUploadError', true);
    }
  }).enqueue(),

  actions: {
    setContact(contact) {
      this.set('model.contact', contact);
      this.onContactChange(contact);
    },
    setBuilding(building) {
      this.set('model.building', building);
      this.onBuildingChange(building);
    },
    setCanceled(value) {
      this.model.set('canceled', value);

      if (!value)
        this.model.set('cancellationReason', null);

      this.save.perform();
    },
    setExecution(execution) {
      this.model.set('mustBeInstalled', false);
      this.model.set('mustBeDelivered', false);

      if (execution == 'installation')
        this.model.set('mustBeInstalled', true);
      else if (execution == 'delivery')
        this.model.set('mustBeDelivered', true);
    },
    uploadProductionTicket(file) {
      this.uploadProductionTicket.perform(file);
    }
  }
});
