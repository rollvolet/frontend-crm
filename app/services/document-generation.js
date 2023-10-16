import Service from '@ember/service';
import fetch from 'fetch';
import previewDocument from '../utils/preview-document';

export default class DocumentGenerationService extends Service {
  // Document generation

  async visitReport(request) {
    await previewDocument(`/requests/${request.id}/documents`, request);
  }

  async interventionReport(intervention) {
    await previewDocument(`/interventions/${intervention.id}/documents`, intervention);
  }

  async offerDocument(offer) {
    await previewDocument(`/offers/${offer.id}/documents`, offer);
  }

  async orderDocument(order) {
    await previewDocument(`/orders/${order.id}/documents`, order);
  }

  async deliveryNote(order) {
    await previewDocument(`/orders/${order.id}/delivery-notes`, order);
  }

  async productionTicketTemplate(_case) {
    await previewDocument(`/cases/${_case.id}/production-ticket-templates`, _case);
  }

  async invoiceDocument(invoice) {
    const resource =
      invoice.constructor.modelName == 'deposit-invoice' ? 'deposit-invoices' : 'invoices';
    await previewDocument(`/${resource}/${invoice.id}/documents`, invoice);
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

  downloadVisitSummary(requestIds) {
    const queryParams = requestIds.map((id) => `ids=${id}`).join('&');
    this._openInNewTab(`/api/files/visit-summary?${queryParams}`);
  }

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

  downloadCertificateTemplate(invoice) {
    const resource =
      invoice.constructor.modelName == 'deposit-invoice' ? 'deposit-invoices' : 'invoices';
    this._openInNewTab(`/api/files/${resource}/${invoice.get('id')}/certificate-template`);
  }

  downloadCertificate(invoice) {
    const resource =
      invoice.constructor.modelName == 'deposit-invoice' ? 'deposit-invoices' : 'invoices';
    this._openInNewTab(`/api/files/${resource}/${invoice.get('id')}/certificate`);
  }

  // Core helpers

  async previewFile(file) {
    const download = await fetch(`/files/${file.id}/download`);
    const location = download.headers.get('Location');
    if (location) {
      const result = await fetch(location);
      const blob = await result.blob();
      this.previewBlob(blob);
    }
  }

  _openInNewTab(href) {
    Object.assign(document.createElement('a'), {
      target: '_blank',
      href,
    }).click();
  }
}
