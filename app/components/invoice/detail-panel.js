import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import constants from '../../config/constants';

const { INVOICE_TYPES } = constants;

export default class InvoiceDetailPanelComponent extends Component {
  @service store;
  @service documentGeneration;

  @tracked editMode = false;
  @tracked isOpenWorkingHoursModal = false;

  caseData = trackedFunction(this, async () => {
    return await this.args.model.case;
  });

  get case() {
    return this.caseData.value;
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
    if (validations.isValid) {
      yield this.args.model.save();
    }
  }

  @action
  setCreditNoteFlag(isCreditNote) {
    this.args.model.type = isCreditNote ? INVOICE_TYPES.CREDIT_NOTE : null;
  }

  @action
  async downloadProductionTicket() {
    const order = await this.case?.order;
    this.documentGeneration.downloadProductionTicket(order);
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
