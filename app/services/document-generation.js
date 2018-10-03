import { warn } from '@ember/debug';
import Service, { inject } from '@ember/service';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';

const onlyAlphaNumeric = /[^a-zA-Z0-9_]|_$/g;

export default Service.extend(FileSaverMixin, {
  ajax: inject(),
  session: inject(),

  visitReport(request) {
    const fileName = this._visitReportName(request);
    return this._generate(`/api/requests/${request.id}/reports`, fileName, 'application/pdf');
  },
  offerDocument(offer) {
    const fileName = this._offerDocumentName(offer);
    return this._generate(`/api/offers/${offer.get('id')}/documents`, fileName, 'application/pdf');
  },
  uploadProductionTicket(order, file) {
    const { access_token } = this.get('session.data.authenticated');
    return file.upload(`/api/orders/${order.id}/production-ticket`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
  },
  downloadProductionTicket(order) {
    const fileName = this._productionTicketName(order);
    return this._download(`/api/orders/${order.id}/production-ticket`, fileName, 'application/pdf');
  },
  downloadOfferDocument(offer) {
    const fileName = this._offerDocumentName(offer);
    return this._download(`/api/offers/${offer.id}/document`, fileName, 'application/pdf');
  },

  _visitReportName(request) {
    return `AD${request.id}_bezoekrapport.pdf`;
  },
  _offerDocumentName(offer) {
    return `${offer.number}_offerte_${offer.documentVersion || ''}`.replace(onlyAlphaNumeric, '') + '.pdf';
  },
  _productionTicketName(order) {
    return `${order.offerNumber}_productiebon`.replace(onlyAlphaNumeric, '') + '.pdf';
  },
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
