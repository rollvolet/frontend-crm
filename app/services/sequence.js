import Service, { inject as service } from '@ember/service';

export default class SequenceService extends Service {
  @service store;

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
