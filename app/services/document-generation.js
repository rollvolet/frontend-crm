import Service, { inject as service } from '@ember/service';
import fetch, { Headers } from 'fetch';

export default class DocumentGenerationService extends Service {
  @service store;

  // Document generation

  async visitReport(request) {
    const data = {
      data: {
        type: 'document-generators',
      },
    };

    const response = await this._generate(`/requests/${request.id}/documents`, data);
    const blob = await response.blob();
    this.previewBlob(blob);
  }

  async interventionReport(intervention) {
    const data = {
      data: {
        type: 'document-generators',
      },
    };

    const response = await this._generate(`/interventions/${intervention.id}/documents`, data);
    const blob = await response.blob();
    this.previewBlob(blob);
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
    const _case = await invoice.case;
    const [customer, contact] = await Promise.all([_case.customer, _case.contact]);
    const language = contact ? await contact.language : await customer.language;

    const data = {
      data: {
        type: 'invoice-document-generators',
        attributes: {
          language: language?.code,
        },
      },
    };

    const response = await this._generate(`/${resource}/${invoice.id}/documents`, data);
    const blob = await response.blob();
    this.previewBlob(blob);
  }

  async certificateTemplate(invoice) {
    const resource =
      invoice.constructor.modelName == 'deposit-invoice' ? 'deposit-invoices' : 'invoices';
    await this._generate(`/api/${resource}/${invoice.get('id')}/certificates`);
    this.downloadCertificateTemplate(invoice);
  }

  async recycleCertificate(sourceInvoice, targetInvoice) {
    const resource =
      targetInvoice.constructor.modelName == 'deposit-invoice' ? 'deposit-invoices' : 'invoices';
    const body = {
      id: sourceInvoice.get('id'),
      type:
        sourceInvoice.constructor.modelName == 'deposit-invoice' ? 'deposit-invoices' : 'invoices',
    };
    await this._generate(
      `/api/${resource}/${targetInvoice.get('id')}/certificate-recyclations`,
      JSON.stringify(body)
    );
  }

  // Document uploads

  uploadProductionTicket(model, file) {
    const resource = model.constructor.modelName == 'order' ? 'orders' : 'interventions';
    return file.upload(`/api/${resource}/${model.id}/production-ticket`);
  }

  uploadCertificate(invoice, file) {
    const resource =
      invoice.constructor.modelName == 'deposit-invoice' ? 'deposit-invoices' : 'invoices';
    return file.upload(`/api/${resource}/${invoice.id}/certificate`);
  }

  // Document removal

  deleteProductionTicket(model) {
    const resource = model.constructor.modelName == 'order' ? 'orders' : 'interventions';
    return fetch(`/api/${resource}/${model.id}/production-ticket`, {
      method: 'DELETE',
    });
  }

  deleteCertificate(invoice) {
    const resource =
      invoice.constructor.modelName == 'deposit-invoice' ? 'deposit-invoices' : 'invoices';
    return fetch(`/api/${resource}/${invoice.id}/certificate`, {
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
  async _generate(url, body) {
    const result = await fetch(url, {
      method: 'POST',
      headers: new Headers({
        Accept: 'application/pdf',
        'Content-Type': 'application/json',
      }),
      body: body ? JSON.stringify(body) : '',
    });

    if (result.ok) {
      return result;
    } else {
      throw result;
    }
  }

  previewBlob(blob) {
    var blobURL = URL.createObjectURL(blob);
    window.open(blobURL);
  }

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
