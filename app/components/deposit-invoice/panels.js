import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import addDays from 'date-fns/addDays';
import { task } from 'ember-concurrency';
import sum from '../../utils/math/sum';
import {
  createCustomerSnapshot,
  createContactSnapshot,
  createBuildingSnapshot,
} from '../../utils/invoice-helpers';
import constants from '../../config/constants';

const { INVOICE_TYPES } = constants;

export default class DepositInvoicePanelsComponent extends Component {
  @service store;
  @service sequence;

  get isLoading() {
    return [this.order, this.vatRate, this.invoice, this.invoicelines].some((p) => p.isPending);
  }

  @cached
  get order() {
    return new TrackedAsyncData(this.args.case.order);
  }

  @cached
  get vatRate() {
    return new TrackedAsyncData(this.args.case.vatRate);
  }

  @cached
  get invoice() {
    return new TrackedAsyncData(this.args.case.invoice);
  }

  get hasInvoice() {
    return this.invoice.isResolved && this.invoice.value != null;
  }

  @cached
  get invoicelines() {
    if (this.order.isResolved) {
      return new TrackedAsyncData(this.order.value.invoicelines);
    } else {
      return [];
    }
  }

  get orderAmount() {
    if (this.invoicelines.isResolved) {
      return sum(this.invoicelines.value.map((line) => line.arithmeticAmount));
    } else {
      return null;
    }
  }

  get vatPercentage() {
    return this.vatRate.isResolved && this.vatRate.value.rate / 100;
  }

  get totalAmount() {
    const amounts = this.args.model.map((depositInvoice) => depositInvoice.arithmeticAmount);
    return sum(amounts);
  }

  get totalVat() {
    return this.totalAmount * this.vatPercentage;
  }

  get isDisabledEdit() {
    return (
      (this.invoice.isResolved && this.invoice.value != null) ||
      (this.order.isResolved && this.order.value.isMasteredByAccess) ||
      this.args.case.isCancelled
    );
  }

  @task
  *createNewDepositInvoice() {
    const [customer, contact, building] = yield Promise.all([
      this.args.case.customer,
      this.args.case.contact,
      this.args.case.building,
    ]);
    const [customerSnap, contactSnap, buildingSnap] = yield Promise.all([
      createCustomerSnapshot(customer),
      createContactSnapshot(contact),
      createBuildingSnapshot(building),
    ]);

    const invoiceDate = new Date();
    const dueDate = addDays(invoiceDate, 14);

    const amount = this.orderAmount * 0.3; // default to 30% of order amount

    const depositInvoice = this.store.createRecord('deposit-invoice', {
      invoiceDate,
      dueDate,
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
    const dueDate = addDays(invoiceDate, 14);

    const [customer, contact, building] = yield Promise.all([
      invoice.customer,
      invoice.contact,
      invoice.building,
    ]);

    const creditNote = this.store.createRecord('deposit-invoice', {
      type: INVOICE_TYPES.CREDIT_NOTE,
      invoiceDate,
      dueDate,
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
