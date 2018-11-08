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
    return this._generate(`/api/requests/${request.id}/reports`, fileName, 'application/pdf');
  },
  offerDocument(offer) {
    const fileName = this._offerDocumentName(offer);
    return this._generate(`/api/offers/${offer.get('id')}/documents`, fileName, 'application/pdf');
  },
  invoiceDocument(invoice) {
    const fileName = this._invoiceDocumentName(invoice);
    return this._generate(`/api/invoices/${invoice.get('id')}/documents`, fileName, 'application/pdf');
  },
  certificate(invoice) {
    const fileName = this._certificateName(invoice);
    return this._generate(`/api/invoices/${invoice.id}/certificates`, fileName, 'application/pdf');
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
    return file.upload(`/api/invoices/${invoice.id}/certificate`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
  },


  // Document downloads

  downloadProductionTicket(order) {
    const fileName = this._productionTicketName(order);
    return this._download(`/api/orders/${order.id}/production-ticket`, fileName, 'application/pdf');
  },
  downloadCertificate(invoice) {
    const fileName = this._certificateName(invoice);
    return this._download(`/api/invoices/${invoice.id}/certificate`, fileName, 'application/pdf');
  },
  downloadOfferDocument(offer) {
    const fileName = this._offerDocumentName(offer);
    return this._download(`/api/offers/${offer.id}/document`, fileName, 'application/pdf');
  },
  downloadInvoiceDocument(invoice) {
    const fileName = this._invoiceDocumentName(invoice);
    return this._download(`/api/invoices/${invoice.id}/document`, fileName, 'application/pdf');
  },


  // Document names

  _visitReportName(request) {
    return `AD${request.id}_bezoekrapport.pdf`;
  },
  _offerDocumentName(offer) {
    return `${offer.number}_offerte_${offer.documentVersion || ''}`.replace(onlyAlphaNumeric, '') + '.pdf';
  },
  _invoiceDocumentName(invoice) {
    return `F${invoice.number}`.replace(onlyAlphaNumeric, '') + '.pdf';
  },
  _productionTicketName(order) {
    return `${order.offerNumber}_productiebon`.replace(onlyAlphaNumeric, '') + '.pdf';
  },
  _certificateName(invoice) {
    return `F${invoice.number}_attest`.replace(onlyAlphaNumeric, '') + '.pdf';
  },


  // Core helpers

  _generate(url, fileName, contentType) {
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
