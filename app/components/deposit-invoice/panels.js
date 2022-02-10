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

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.vatRate = yield this.order.vatRate;
    if (!this.vatRate) {
      debug('Order VAT rate got lost. Updating VAT rate to VAT rate of first invoiceline.');
      const invoiceline = yield this.store.queryOne('invoiceline', {
        'filter[order]': this.order.uri,
        sort: 'position',
      });
      if (invoiceline) {
        this.vatRate = yield invoiceline.vatRate;
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

    const depositInvoice = this.store.createRecord('deposit-invoice', {
      invoiceDate,
      dueDate,
      reference: offer.reference,
      order: this.order,
      vatRate: this.vatRate,
      baseAmount: 0,
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
    const order = yield invoice.order;
    const vatRate = yield invoice.vatRate;

    const creditNote = this.store.createRecord('deposit-invoice', {
      invoiceDate,
      dueDate,
      isCreditNote: true,
      reference: invoice.reference,
      baseAmount: invoice.baseAmount,
      order,
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
