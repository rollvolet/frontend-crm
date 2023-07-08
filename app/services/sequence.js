import Service, { inject as service } from '@ember/service';

export default class SequenceService extends Service {
  @service store;

  async fetchNextCustomerNumber() {
    const customer = await this.store.queryOne('customer', { sort: '-number' });
    return customer.number + 1;
  }

  async fetchNextContactPosition(customer) {
    const contact = await this.store.queryOne('contact', {
      sort: '-position',
      'filter[customer][:uri:]': customer.uri,
    });
    return contact ? contact.position + 1 : 1;
  }

  async fetchNextBuildingPosition(customer) {
    const building = await this.store.queryOne('building', {
      sort: '-position',
      'filter[customer][:uri:]': customer.uri,
    });
    return building ? building.position + 1 : 1;
  }

  async fetchNextInvoiceNumber() {
    // TODO create year into account such that count starts at 0 automatically
    // at the start of a new year?
    const invoices = await Promise.all([
      this.store.queryOne('invoice', { sort: '-number' }),
      this.store.queryOne('deposit-invoice', { sort: '-number' }),
    ]);

    const number = Math.max(...invoices.map((invoice) => invoice?.number));
    return number + 1;
  }
}
