import Component from '@glimmer/component';
import { service } from '@ember/service';
import addDays from 'date-fns/addDays';
import { task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import { isPresent } from '@ember/utils';
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

  orderData = trackedFunction(this, async () => {
    return await this.args.case.order;
  });

  orderAmountData = trackedFunction(this, async () => {
    if (this.order) {
      const lines = await this.order.invoicelines;
      return sum(lines.map((line) => line.arithmeticAmount));
    } else {
      return null;
    }
  });

  vatRateData = trackedFunction(this, async () => {
    return await this.args.case.vatRate;
  });

  get order() {
    return this.orderData.value;
  }

  get orderAmount() {
    return this.orderAmountData.value;
  }

  get vatRate() {
    return this.vatRateData.value;
  }

  get isDisabledEdit() {
    return this.hasInvoice || this.order?.isMasteredByAccess || this.args.case.isCancelled;
  }

  get hasInvoice() {
    return isPresent(this.args.case.invoice.get('id'));
  }

  get totalAmount() {
    const amounts = this.args.model.map((invoice) => invoice.arithmeticAmount);
    return sum(amounts);
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
