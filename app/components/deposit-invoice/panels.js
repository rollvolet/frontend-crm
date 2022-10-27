import Component from '@glimmer/component';
import { debug } from '@ember/debug';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';
import sum from '../../utils/math/sum';
import { keepLatestTask, task } from 'ember-concurrency';

export default class DepositInvoicePanelsComponent extends Component {
  @service case;
  @service store;

  @tracked vatRate;
  @tracked invoicelines = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.vatRate = yield this.order.vatRate;
    // TODO use this.order.invoicelines once the relation is defined
    const invoicelines = yield this.store.query('invoiceline', {
      'filter[:exact:order]': this.order.uri,
      sort: 'position',
      page: { size: 100 },
    });
    this.invoicelines = invoicelines.toArray();

    if (!this.vatRate) {
      debug('Order VAT rate got lost. Updating VAT rate to VAT rate of first invoiceline.');
      if (invoicelines.firstObject) {
        this.vatRate = yield invoicelines.firstObject.vatRate;
        this.order.vatRate = this.vatRate;
        yield this.order.save();
      }
    }
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

  get orderAmount() {
    return sum(this.invoicelines.map((line) => line.arithmeticAmount));
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

    const invoiceDate = new Date();
    const dueDate = moment(invoiceDate).add(14, 'days').toDate();

    const amount = this.orderAmount * 0.3; // default to 30% of order amount

    const depositInvoice = this.store.createRecord('deposit-invoice', {
      invoiceDate,
      dueDate,
      certificateRequired: this.vatRate.rate == 6,
      certificateReceived: false,
      certificateClosed: false,
      reference: offer.reference,
      order: this.order,
      vatRate: this.vatRate,
      baseAmount: amount,
      customer,
      contact,
      building,
    });

    const { validations } = yield depositInvoice.validate();
    if (validations.isValid) yield depositInvoice.save();

    this.args.didCreateDepositInvoice(depositInvoice);
  }

  @task
  *createNewCreditNoteForDepositInvoice(invoice) {
    const invoiceDate = new Date();
    const dueDate = moment(invoiceDate).add(14, 'days').toDate();

    const customer = yield invoice.customer;
    const contact = yield invoice.contact;
    const building = yield invoice.building;
    const vatRate = yield invoice.vatRate;

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
      vatRate,
      customer,
      contact,
      building,
    });

    const { validations } = yield creditNote.validate();
    if (validations.isValid) yield creditNote.save();

    this.args.didCreateDepositInvoice(creditNote);
  }
}
