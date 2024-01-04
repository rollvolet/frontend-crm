import Service, { inject as service } from '@ember/service';
import startOfYearFn from 'date-fns/startOfYear';
import addYears from 'date-fns/addYears';
import format from 'date-fns/format';
import formatISO from 'date-fns/formatISO';

export default class SequenceService extends Service {
  @service store;

  async fetchNextCustomerNumber() {
    const customer = await this.store.queryOne('customer', { sort: '-number' });
    return customer ? customer.number + 1 : 1;
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

  async fetchNextInterventionNumber() {
    const intervention = await this.store.queryOne('intervention', { sort: '-number' });
    return intervention ? intervention.number + 1 : 1;
  }

  async fetchNextRequestNumber() {
    const request = await this.store.queryOne('request', { sort: '-number' });
    return request ? request.number + 1 : 1;
  }

  async fetchNextOfferNumber() {
    const number = format(addYears(new Date(), 10), 'yy/MM/dd');
    const offer = await this.store.queryOne('offer', {
      sort: '-number',
      'filter[number]': number,
    });
    if (offer) {
      const sequenceNumber = parseInt(offer.number.substr(offer.number.lastIndexOf('/') + 1));
      const postfix = `${sequenceNumber + 1}`.padStart(2, '0');
      return `${number}/${postfix}`;
    } else {
      return `${number}/01`;
    }
  }

  async fetchNextInvoiceNumber() {
    const startOfYear = startOfYearFn(new Date());
    const invoices = await Promise.all([
      this.store.queryOne('invoice', {
        sort: '-number',
        'filter[:gte:invoice-date]': formatISO(startOfYear, { representation: 'date' }),
      }),
      this.store.queryOne('deposit-invoice', {
        sort: '-number',
        'filter[:gte:invoice-date]': formatISO(startOfYear, { representation: 'date' }),
      }),
    ]);
    const number = Math.max(...invoices.map((invoice) => invoice?.number || 0));

    if (number > 0) {
      return number + 1;
    } else {
      // First invoice of a new year
      const prefix = parseInt(format(startOfYear, 'yy')) + 10;
      return prefix * 10000 + 1; // e.g. 340001
    }
  }
}
