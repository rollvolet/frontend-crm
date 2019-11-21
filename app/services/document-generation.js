import { warn } from '@ember/debug';
import Service, { inject } from '@ember/service';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
import $ from 'jquery';

const onlyAlphaNumeric = /[^a-zA-Z0-9_]|_$/g;

export default Service.extend(FileSaverMixin, {
  ajax: inject(),
  session: inject(),

  // Document generation

  visitReport(request) {
    const fileName = this._visitReportName(request);
    return this._generateAndDownload(`/api/requests/${request.id}/reports`, fileName, 'application/pdf');
  },
  async offerDocument(offer) {
    await this._generate(`/api/offers/${offer.get('id')}/documents`);
    this.downloadOfferDocument(offer);
  },
  async orderDocument(order) {
    await this._generate(`/api/orders/${order.get('id')}/documents`);
    this.downloadOrderDocument(order);
  },
  async deliveryNote(order) {
    await this._generate(`/api/orders/${order.get('id')}/delivery-notes`);
    this.downloadDeliveryNote(order);
  },
  async invoiceDocument(invoice) {
    const resource = invoice.constructor.modelName == 'deposit-invoice' ? 'deposit-invoices' : 'invoices';
    await this._generate(`/api/${resource}/${invoice.get('id')}/documents`);
    this.downloadInvoiceDocument(invoice);
  },
  async certificateTemplate(invoice) {
    const resource = invoice.constructor.modelName == 'deposit-invoice' ? 'deposit-invoices' : 'invoices';
    await this._generate(`/api/${resource}/${invoice.get('id')}/certificates`);
    this.downloadCertificateTemplate(invoice);
  },


  // Document uploads

  uploadProductionTicket(order, file) {
    const { access_token } = this.get('session.data.authenticated');
    return file.upload(`/api/orders/${order.id}/production-ticket`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
  },
  uploadCertificate(invoice, file) {
    const { access_token } = this.get('session.data.authenticated');
    const resource = invoice.constructor.modelName == 'deposit-invoice' ? 'deposit-invoices' : 'invoices';
    return file.upload(`/api/${resource}/${invoice.id}/certificate`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
  },


  // Document downloads

  async downloadProductionTicket(order) {
    const fileName = await this._productionTicketName(order);
    return this._download(`/api/orders/${order.id}/production-ticket`, fileName, 'application/pdf');
  },
  downloadOfferDocument(offer) {
    this._openInNewTab(`/api/files/offers/${offer.get('id')}`);
  },
  downloadOrderDocument(order) {
    this._openInNewTab(`/api/files/orders/${order.get('id')}`);
  },
  downloadDeliveryNote(order) {
    this._openInNewTab(`/api/files/orders/${order.get('id')}`);
  },
  downloadInvoiceDocument(invoice) {
    const resource = invoice.constructor.modelName == 'deposit-invoice' ? 'deposit-invoices' : 'invoices';
    this._openInNewTab(`/api/files/${resource}/${invoice.get('id')}`);
  },
  downloadCertificateTemplate(invoice) {
    const resource = invoice.constructor.modelName == 'deposit-invoice' ? 'deposit-invoices' : 'invoices';
    this._openInNewTab(`/api/files/${resource}/${invoice.get('id')}/certificate-template`);
  },
  downloadCertificate(invoice) {
    const resource = invoice.constructor.modelName == 'deposit-invoice' ? 'deposit-invoices' : 'invoices';
    this._openInNewTab(`/api/files/${resource}/${invoice.get('id')}/certificate`);
  },


  // Document names

  _visitReportName(request) {
    return `AD${request.id}_bezoekrapport.pdf`;
  },
  async _productionTicketName(order) {
    const customer = await order.customer;
    return `${order.offerNumber}`.replace(onlyAlphaNumeric, '') + `_${customer.name}.pdf`;
  },
  async _receivedCertificateName(invoice) {
    const customer = await invoice.customer;
    return `A0${invoice.number}`.replace(onlyAlphaNumeric, '') + `_${customer.name}.pdf`;
  },


  // Core helpers
  _generate(url,  method = 'POST') {
    const { access_token } = this.get('session.data.authenticated');
    return this.ajax.request(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
  },
  _openInNewTab(href) {
    Object.assign(document.createElement('a'), {
      target: '_blank',
      href,
    }).click();
  },

  // TODO replace with _generate() and _openInNewTab()
  _generateAndDownload(url, fileName, contentType) {
    return this._download(url, fileName, contentType, 'POST');
  },
  _download(url, fileName, contentType, method = 'GET') {
    const { access_token } = this.get('session.data.authenticated');
    return this.ajax.request(url, {
      method: method,
      dataType: 'binary',
      xhr: () => { // hack to prevent ember-ajax tries to parse the response as JSON. See https://github.com/ember-cli/ember-ajax/issues/321
        const myXhr = $.ajaxSettings.xhr();
        myXhr.responseType = 'arraybuffer';
        return myXhr;
      },
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    }).then((content) => {
      this.saveFileAs(fileName, content, contentType);
      return fileName;
    }).catch(function(e) {
      warn(`Download ${url} failed: ${e.message || JSON.stringify(e)}`, { id: 'download.failure' });
      return null;
    });
  }
});
