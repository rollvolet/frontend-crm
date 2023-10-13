import Service, { inject as service } from '@ember/service';
import fetch, { Headers } from 'fetch';

async function _bodyWithLanguage(record) {
  let language = null;
  if (record) {
    const _case = await record.case;
    const [customer, contact] = await Promise.all([_case.customer, _case.contact]);
    language = contact ? await contact.language : await customer.language;
  }

  return {
    data: {
      type: 'document-generators',
      attributes: {
        language: language?.code,
      },
    },
  };
}

export default class DocumentGenerationService extends Service {
  @service store;

  // Document generation

  async visitReport(request) {
    const data = await _bodyWithLanguage();
    await this._generate(`/requests/${request.id}/documents`, data);
  }

  async interventionReport(intervention) {
    const data = await _bodyWithLanguage();
    await this._generate(`/interventions/${intervention.id}/documents`, data);
  }

  async offerDocument(offer) {
    const data = await _bodyWithLanguage(offer);
    await this._generate(`/offers/${offer.id}/documents`, data);
  }

  async orderDocument(order) {
    const data = await _bodyWithLanguage(order);
    await this._generate(`/orders/${order.id}/documents`, data);
  }

  async deliveryNote(order) {
    const data = await _bodyWithLanguage(order);
    await this._generate(`/orders/${order.id}/delivery-notes`, data);
  }

  async productionTicketTemplate(_case) {
    const data = await _bodyWithLanguage();
    await this._generate(`/cases/${_case.id}/production-ticket-templates`, data);
  }

  async invoiceDocument(invoice) {
    const resource =
      invoice.constructor.modelName == 'deposit-invoice' ? 'deposit-invoices' : 'invoices';
    const data = await _bodyWithLanguage(invoice);
    await this._generate(`/${resource}/${invoice.id}/documents`, data);
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
  async _generate(url, body) {
    const response = await fetch(url, {
      method: 'POST',
      headers: new Headers({
        Accept: 'application/pdf',
        'Content-Type': 'application/json',
      }),
      body: body ? JSON.stringify(body) : '',
    });

    if (response.ok) {
      const blob = await response.blob();
      this.previewBlob(blob);
    } else {
      throw response;
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
