import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import moment from 'moment';
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
    const intervention = this.modelFor('main.case.intervention.edit');
    const [vatRate, customer, contact, building] = await Promise.all([
      _case.vatRate,
      intervention.customer,
      intervention.contact,
      intervention.building,
    ]);

    const invoiceDate = new Date();
    const dueDate = moment(invoiceDate).add(14, 'days').toDate();

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
      certificateRequired: vatRate.rate == 6,
      certificateReceived: false,
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
    this.router.transitionTo('main.case.invoice.edit', _case, model);
  }
}
