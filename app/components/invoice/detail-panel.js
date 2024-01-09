import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import previewDocument from '../../utils/preview-document';
import constants from '../../config/constants';

const { INVOICE_TYPES, FILE_TYPES } = constants;

export default class InvoiceDetailPanelComponent extends Component {
  @service store;

  @tracked editMode = false;
  @tracked isOpenWorkingHoursModal = false;

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
    const _case = await this.args.model.case;
    previewDocument(FILE_TYPES.PRODUCTION_TICKET, _case.uri);
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
