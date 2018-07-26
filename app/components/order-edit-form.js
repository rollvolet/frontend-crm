import Component from '@ember/component';
import { mapBy } from 'ember-awesome-macros/array';
import { sum } from 'ember-awesome-macros';
import raw from 'ember-macro-helpers/raw';
import { inject as service } from '@ember/service';
import DecimalInputFormatting from '../mixins/decimal-input-formatting';

export default Component.extend(DecimalInputFormatting, {
  store: service(),

  model: null,
  save: null,
  onContactChange: null,
  onBuildingChange: null,
  onCreateNewDeposit: null,
  showDepositsDialog: false,

  init() {
    this._super(...arguments);
    this.initDecimalInput('amount');
    this.initDecimalInput('scheduledHours');
    this.initDecimalInput('scheduledNbOfPersons');
    this.initDecimalInput('invoicableHours');
    this.initDecimalInput('invoicableNbOfPersons');
  },

  depositsAmount: sum(mapBy('model.deposits', raw('amount'))),

  actions: {
    closeDepositsDialog() {
      this.set('showDepositsDialog', false);
    },
    openDepositsDialog() {
      this.set('showDepositsDialog', true);
    },
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
