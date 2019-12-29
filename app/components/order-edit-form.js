import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import Component from '@ember/component';
import DecimalInputFormatting from '../mixins/decimal-input-formatting';
import { task } from 'ember-concurrency';

@classic
export default class OrderEditForm extends Component.extend(DecimalInputFormatting) {
  @service
  store;

  @service
  documentGeneration;

  model = null;
  save = null;
  hasProductionTicketUploadError = false;
  showProductionTicketNotFoundDialog = false;

  init() {
    super.init(...arguments);
    this.initDecimalInput('scheduledHours');
    this.initDecimalInput('scheduledNbOfPersons');
    this.initVisitor.perform();
  }

  @(task(function * () {
    const offer = yield this.model.offer;
    const request = yield offer.request;
    if (request.visitor) {
      const visitor = this.store.peekAll('employee').find(e => e.firstName == request.visitor);
      this.set('visitor', visitor);
    }
  }).keepLatest())
  initVisitor;

  @(task(function * (file) {
    try {
      this.set('hasProductionTicketUploadError', false);
      yield this.documentGeneration.uploadProductionTicket(this.model, file);
    } catch (e) {
      warn(`Error while uploading production ticket: ${e.message || JSON.stringify(e)}`, { id: 'failure.upload' } );
      file.queue.remove(file);
      this.set('hasProductionTicketUploadError', true);
    }
  }).enqueue())
  uploadProductionTicket;

  @action
  setCanceled(value) {
    this.model.set('canceled', value);

    if (!value)
      this.model.set('cancellationReason', null);

    this.save.perform();
  }

  @action
  setExecution(execution) {
    this.model.set('mustBeInstalled', false);
    this.model.set('mustBeDelivered', false);

    if (execution == 'installation')
      this.model.set('mustBeInstalled', true);
    else if (execution == 'delivery')
      this.model.set('mustBeDelivered', true);
  }

  @action
  async setVisitor(visitor) {
    this.set('visitor', visitor);
    const firstName = visitor ? visitor.firstName : null;
    const offer = await this.model.offer;
    const request = await offer.request;
    request.set('visitor', firstName);
  }

  @action
  uploadProductionTicket(file) {
    this.uploadProductionTicket.perform(file);
  }

  @action
  async downloadProductionTicket() {
    const document = await this.documentGeneration.downloadProductionTicket(this.model);

    if (!document)
      this.set('showProductionTicketNotFoundDialog', true);
  }
}
