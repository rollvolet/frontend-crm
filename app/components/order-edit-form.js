import Component from '@ember/component';
import { inject as service } from '@ember/service';
import DecimalInputFormatting from '../mixins/decimal-input-formatting';

export default Component.extend(DecimalInputFormatting, {
  store: service(),

  model: null,
  save: null,
  onContactChange: null,
  onBuildingChange: null,

  init() {
    this._super(...arguments);
    this.initDecimalInput('amount');
    this.initDecimalInput('scheduledHours');
    this.initDecimalInput('scheduledNbOfPersons');
    this.initDecimalInput('invoicableHours');
    this.initDecimalInput('invoicableNbOfPersons');
  },

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
    }
  }
});
