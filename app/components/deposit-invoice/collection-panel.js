import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask, task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import sum from '../../utils/math/sum';
import moment from 'moment';

export default class DepositInvoiceCollectionPanelComponent extends Component {
  @service case
  @service store

  @tracked vatRate
  @tracked selected
  @tracked depositInvoices = []
  @tracked showUnsavedChangesDialog = false

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.depositInvoices = this.args.model.slice(0);
    this.vatRate = yield this.order.vatRate;
  }

  get customer() {
    return this.case.current && this.case.current.customer;
  }

  get building() {
    return this.case.current && this.case.current.building;
  }

  get contact() {
    return this.case.current && this.case.current.contact;
  }

  get offer() {
    return this.case.current && this.case.current.offer;
  }

  get order() {
    return this.case.current && this.case.current.order;
  }

  get invoice() {
    return this.case.current && this.case.current.invoice;
  }

  get isDisabledEdit() {
    return this.order.isMasteredByAccess || this.invoice;
  }

  get totalAmount() {
    return sum(this.depositInvoices.mapBy('arithmeticAmount'));
  }

  get vatPercentage() {
    return this.vatRate && this.vatRate.rate / 100;
  }

  get totalVat() {
    return this.totalAmount * this.vatPercentage;
  }

  get editMode() {
    return this.selected;
  }

  @task
  *createNew() {
    const invoiceDate = new Date();
    const dueDate = moment(invoiceDate).add(14, 'days').toDate();

    const depositInvoice = this.store.createRecord('deposit-invoice', {
      invoiceDate,
      dueDate,
      certificateRequired: this.vatRate.rate == 6,
      certificateReceived: false,
      certificateClosed: false,
      reference: this.offer.reference,
      order: this.order,
      vatRate: this.vatRate,
      customer: this.customer,
      contact: this.contact,
      building: this.building
    });

    const { validations } = yield depositInvoice.validate();
    if (validations.isValid)
      yield depositInvoice.save();

    this.selected = depositInvoice;
    this.depositInvoices.pushObject(depositInvoice);
  }

  @task
  *createNewCreditNoteForDepositInvoice(invoice) {
    const invoiceDate = new Date();
    const dueDate = moment(invoiceDate).add(14, 'days').toDate();

    const creditNote = this.store.createRecord('deposit-invoice', {
      invoiceDate,
      dueDate,
      isCreditNote: true,
      certificateRequired: false,
      certificateReceived: false,
      certificateClosed: false,
      reference: invoice.reference,
      baseAmount: invoice.baseAmount,
      order: this.order,
      vatRate: this.vatRate,
      customer: this.customer,
      contact: this.contact,
      building: this.building
    });

    const { validations } = yield creditNote.validate();
    if (validations.isValid)
      yield creditNote.save();

    this.depositInvoices.pushObject(creditNote);
  }

  @task
  *remove(invoice) {
    this.depositInvoices.removeObject(invoice);
    yield invoice.destroyRecord();
  }

  @task
  *rollbackTree() {
    if (this.selected.isNew) {
      this.depositInvoices.removeObject(this.selected);
      yield this.selected.destroyRecord();
    } else {
      const rollbackPromises = [];
      this.selected.rollbackAttributes();
      rollbackPromises.push(this.selected.belongsTo('vatRate').reload());
      yield all(rollbackPromises);
      yield this.save.perform(null, { forceSucces: true });
    }
  }

  @keepLatestTask
  *save(_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.selected.validate();
    if (validations.isValid) {
      yield this.selected.save();
    }
  }

  @action
  openEdit(invoice) {
    if (this.selected && this.selected.isNew)
      this.selected.destroyRecord();
    this.selected = invoice;
  }

  @action
  closeEdit() {
    if (this.selected.isNew || this.selected.validations.isInvalid || this.selected.isError
        || (this.save.last && this.save.last.isError)) {
      this.showUnsavedChangesDialog = true;
    } else {
      this.selected = null;
    }
  }

  @action
  closeUnsavedChangesDialog() {
    this.showUnsavedChangesDialog = false;
  }

  @action
  async confirmCloseEdit() {
    this.showUnsavedChangesDialog = false;
    await this.rollbackTree.perform();
    this.selected = null;
  }
}
