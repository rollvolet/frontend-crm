import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';
import sum from '../../utils/math/sum';
import { task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import {
  createCustomerSnapshot,
  createContactSnapshot,
  createBuildingSnapshot,
} from '../../utils/invoice-helpers';
import constants from '../../config/constants';

const { INVOICE_TYPES } = constants;

export default class DepositInvoicePanelsComponent extends Component {
  @service store;
  @service case;
  @service sequence;

  @tracked orderAmount;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    const lines = yield this.store.query('invoiceline', {
      'filter[:exact:order]': this.args.case.order,
      sort: 'position',
      page: { size: 100 },
    });
    this.orderAmount = sum(lines.mapBy('arithmeticAmount'));
  }

  vatRateData = trackedFunction(this, async () => {
    return await this.args.case.vatRate;
  });

  get vatRate() {
    return this.vatRateData.value;
  }

  get order() {
    return this.case.current && this.case.current.order;
  }

  get invoice() {
    return this.args.case.invoice;
  }

  get isDisabledEdit() {
    return this.order?.isMasteredByAccess || this.invoice;
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
    const [customer, contact, building] = yield Promise.all([
      this.order?.customer,
      this.order?.contact,
      this.order?.building,
    ]);
    const [customerSnap, contactSnap, buildingSnap] = yield Promise.all([
      createCustomerSnapshot(customer),
      createContactSnapshot(contact),
      createBuildingSnapshot(building),
    ]);

    const invoiceDate = new Date();
    const dueDate = moment(invoiceDate).add(14, 'days').toDate();

    const amount = this.orderAmount * 0.3; // default to 30% of order amount

    const depositInvoice = this.store.createRecord('deposit-invoice', {
      invoiceDate,
      dueDate,
      certificateRequired: this.vatRate.rate == 6,
      certificateReceived: false,
      totalAmountNet: amount,
      case: this.args.case,
      customer: customerSnap,
      contact: contactSnap,
      building: buildingSnap,
    });

    const { validations } = yield depositInvoice.validate();
    if (validations.isValid) {
      depositInvoice.number = yield this.sequence.fetchNextInvoiceNumber();
      yield depositInvoice.save();
    }

    this.args.didCreateDepositInvoice(depositInvoice);
  }

  @task
  *createNewCreditNoteForDepositInvoice(invoice) {
    const invoiceDate = new Date();
    const dueDate = moment(invoiceDate).add(14, 'days').toDate();

    const [customer, contact, building] = yield Promise.all([
      invoice.customer,
      invoice.contact,
      invoice.building,
    ]);

    const creditNote = this.store.createRecord('deposit-invoice', {
      type: INVOICE_TYPES.CREDIT_NOTE,
      invoiceDate,
      dueDate,
      certificateRequired: false,
      certificateReceived: false,
      totalAmountNet: invoice.totalAmountNet,
      creditedInvoice: invoice,
      case: this.args.case,
      customer,
      contact,
      building,
    });

    const { validations } = yield creditNote.validate();
    if (validations.isValid) {
      creditNote.number = yield this.sequence.fetchNextInvoiceNumber();
      yield creditNote.save();
    }

    this.args.didCreateDepositInvoice(creditNote);
  }
}
