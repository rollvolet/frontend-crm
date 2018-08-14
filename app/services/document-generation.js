import { warn } from '@ember/debug';
import Service, { inject } from '@ember/service';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';

export default Service.extend(FileSaverMixin, {
  ajax: inject(),
  session: inject(),

  visitReport(request) {
    return this._generate(`/api/requests/${request.id}/reports`,
                   `${request.id}-bezoekrapport.pdf`,
                  'application/pdf');
  },
  offerDocument(offer) {
    return this._generate(`/api/offers/${offer.get('id')}/documents`,
                   `${offer.number}-offerte.pdf`,
                  'application/pdf');
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
    return this._download(`/api/orders/${order.id}/production-ticket`,
                          `${order.offerNumber}-productiebon.pdf`,
                          'application/pdf');
  },
  downloadOfferDocument(offer) {
    return this._download(`/api/offers/${offer.id}/document`,
                          `${offer.number}-offerte.pdf`,
                          'application/pdf');
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
