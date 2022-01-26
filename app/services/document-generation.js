import Service from '@ember/service';
import fetch, { Headers } from 'fetch';

export default class DocumentGenerationService extends Service {
  // Document generation

  async visitReport(request) {
    await this._generate(`/api/requests/${request.get('id')}/reports`);
    this.downloadVisitReport(request);
  }

  async interventionReport(intervention) {
    await this._generate(`/api/interventions/${intervention.get('id')}/reports`);
    this.downloadInterventionReport(intervention);
  }

  async offerDocument(offer) {
    await this._generate(`/api/offers/${offer.get('id')}/documents`);
    this.downloadOfferDocument(offer);
  }

  async orderDocument(order) {
    await this._generate(`/api/orders/${order.get('id')}/documents`);
    this.downloadOrderDocument(order);
  }

  async deliveryNote(order) {
    await this._generate(`/api/orders/${order.get('id')}/delivery-notes`);
    this.downloadDeliveryNote(order);
  }

  async productionTicketTemplate(order) {
    await this._generate(`/api/orders/${order.get('id')}/production-tickets`);
    this.downloadProductionTicketTemplate(order);
  }

  async invoiceDocument(invoice) {
    const resource =
      invoice.constructor.modelName == 'deposit-invoice' ? 'deposit-invoices' : 'invoices';
    await this._generate(`/api/${resource}/${invoice.get('id')}/documents`);
    this.downloadInvoiceDocument(invoice);
  }

  // Document uploads

  uploadProductionTicket(model, file) {
    const resource = model.constructor.modelName == 'order' ? 'orders' : 'interventions';
    return file.upload(`/api/${resource}/${model.id}/production-ticket`);
  }

  // Document removal

  deleteProductionTicket(model) {
    const resource = model.constructor.modelName == 'order' ? 'orders' : 'interventions';
    return fetch(`/api/${resource}/${model.id}/production-ticket`, {
      method: 'DELETE',
    });
  }

  // Document downloads

  downloadVisitReport(request) {
    this._openInNewTab(`/api/files/requests/${request.get('id')}`);
  }

  downloadInterventionReport(intervention) {
    this._openInNewTab(`/api/files/interventions/${intervention.get('id')}`);
  }

  downloadOfferDocument(offer) {
    this._openInNewTab(`/api/files/offers/${offer.get('id')}`);
  }

  downloadOrderDocument(order) {
    this._openInNewTab(`/api/files/orders/${order.get('id')}`);
  }

  downloadDeliveryNote(order) {
    this._openInNewTab(`/api/files/delivery-notes/${order.get('id')}`);
  }

  downloadProductionTicketTemplate(order) {
    this._openInNewTab(`/api/files/production-ticket-templates/${order.get('id')}`);
  }

  downloadProductionTicket(order, options) {
    const defaultOptions = { watermark: false };
    const opts = Object.assign({}, defaultOptions, options);
    const query = Object.keys(opts)
      .map((k) => `${k}=${opts[k]}`)
      .join('&');
    this._openInNewTab(`/api/files/production-tickets/${order.get('id')}?${query}`);
  }

  downloadInvoiceDocument(invoice) {
    const resource =
      invoice.constructor.modelName == 'deposit-invoice' ? 'deposit-invoices' : 'invoices';
    this._openInNewTab(`/api/files/${resource}/${invoice.get('id')}`);
  }

  // Core helpers
  async _generate(url, body = '') {
    const result = await fetch(url, {
      method: 'POST',
      headers: new Headers({
        Accept: 'application/pdf',
        'Content-Type': 'application/json',
      }),
      body: body,
    });

    if (result.ok) {
      return result;
    } else {
      throw result;
    }
  }

  _openInNewTab(href) {
    Object.assign(document.createElement('a'), {
      target: '_blank',
      href,
    }).click();
  }
}
