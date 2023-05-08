import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debug } from '@ember/debug';
import { task } from 'ember-concurrency';
import constants from '../../config/constants';

const { INVOICE_TYPES } = constants;

export default class InvoiceDetailPanelComponent extends Component {
  @service case;
  @service store;
  @service documentGeneration;

  @tracked editMode = false;
  @tracked isOpenWorkingHoursModal = false;

  get order() {
    return this.case.current?.order;
  }

  get technicianNames() {
    return this.args.model.technicalWorkActivities
      .mapBy('employee')
      .uniqBy('firstName')
      .sortBy('firstName')
      .mapBy('firstName');
  }

  @task
  *save() {
    const { validations } = yield this.args.model.validate();
    let requiresOfferReload = false;
    if (validations.isValid) {
      const _case = yield this.args.model.case;
      const changedAttributes = _case.changedAttributes();
      // TODO remove syncing once order is refactored to triplestore
      const fieldsToSyncWithOrder = ['reference', 'comment'];
      for (let field of fieldsToSyncWithOrder) {
        if (changedAttributes[field]) {
          if (this.order) {
            debug(`Syncing ${field} of offer/order with updated ${field} of case`);
            this.order[field] = _case[field];
            yield this.order.save();
          }
          requiresOfferReload = true;
        }
      }

      yield this.args.model.save();
      yield _case.save();

      if (this.order && requiresOfferReload) {
        yield this.order.belongsTo('offer').reload();
      }
    }
  }

  @action
  async setVatRate(vatRate) {
    const _case = await this.args.model.case;
    _case.vatRate = vatRate;
    this.args.model.certificateRequired = vatRate?.rate == 6;
    this.args.onChangeVatRate(vatRate);
  }

  @action
  setCreditNoteFlag(isCreditNote) {
    this.args.model.type = isCreditNote ? INVOICE_TYPES.CREDIT_NOTE : null;
  }

  @action
  async downloadProductionTicket() {
    const order = await this.order;
    await this.documentGeneration.downloadProductionTicket(order);
  }

  @action
  openEdit() {
    this.editMode = true;
  }

  @action
  closeEdit() {
    this.editMode = false;
  }

  @action
  openWorkingHoursModal() {
    this.isOpenWorkingHoursModal = true;
  }

  @action
  closeWorkingHoursModal() {
    this.isOpenWorkingHoursModal = false;
  }
}
