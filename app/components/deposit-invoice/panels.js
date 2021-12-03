import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';
import sum from '../../utils/math/sum';
import { keepLatestTask, task } from 'ember-concurrency';

export default class DepositInvoicePanelsComponent extends Component {
  @service case;
  @service store;

  @tracked vatRate;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.vatRate = yield this.order.vatRate;
  }

  get customer() {
    return this.case.current && this.case.current.customer;
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
    return sum(this.args.model.mapBy('arithmeticAmount'));
  }

  get vatPercentage() {
    return this.vatRate && this.vatRate.rate / 100;
  }

  get totalVat() {
    return this.totalAmount * this.vatPercentage;
  }

  @task
  *createNewDepositInvoice() {
    const offer = yield this.order.offer;
    const customer = this.customer;
    const contact = yield this.order.contact;
    const building = yield this.order.building;
    const vatRate = yield this.order.vatRate;

    const invoiceDate = new Date();
    const dueDate = moment(invoiceDate).add(14, 'days').toDate();

    const depositInvoice = this.store.createRecord('deposit-invoice', {
      invoiceDate,
      dueDate,
      certificateRequired: vatRate.rate == 6,
      certificateReceived: false,
      certificateClosed: false,
      reference: offer.reference,
      order: this.order,
      baseAmount: 0,
      vatRate,
      customer,
      contact,
      building,
    });

    const { validations } = yield depositInvoice.validate();
    if (validations.isValid) yield depositInvoice.save();

    this.args.didCreateDepositInvoice();
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
      building: this.building,
    });

    const { validations } = yield creditNote.validate();
    if (validations.isValid) yield creditNote.save();

    this.args.didCreateDepositInvoice();
  }
}
