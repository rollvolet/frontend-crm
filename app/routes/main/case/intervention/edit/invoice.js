import Route from '@ember/routing/route';
import { service } from '@ember/service';
import addDays from 'date-fns/addDays';
import {
  createCustomerSnapshot,
  createContactSnapshot,
  createBuildingSnapshot,
} from '../../../../../utils/invoice-helpers';

export default class MainCaseInterventionEditInvoiceRoute extends Route {
  @service store;
  @service router;
  @service sequence;

  async model() {
    const _case = this.modelFor('main.case');
    const [customer, contact, building] = await Promise.all([
      _case.customer,
      _case.contact,
      _case.building,
    ]);

    const invoiceDate = new Date();
    const profile = await customer.profile;
    const dueDate = addDays(invoiceDate, profile.invoicePaymentPeriod);

    const [customerSnap, contactSnap, buildingSnap] = await Promise.all([
      createCustomerSnapshot(customer),
      createContactSnapshot(contact),
      createBuildingSnapshot(building),
    ]);
    const number = await this.sequence.fetchNextInvoiceNumber();

    const invoice = this.store.createRecord('invoice', {
      invoiceDate,
      dueDate,
      number,
      case: _case,
      customer: customerSnap,
      contact: contactSnap,
      building: buildingSnap,
    });

    await invoice.save();

    return invoice;
  }

  afterModel(model) {
    const _case = this.modelFor('main.case');
    this.router.transitionTo('main.case.invoice.edit', _case.id, model.id);
  }
}
