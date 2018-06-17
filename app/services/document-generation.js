import Service, { inject } from '@ember/service';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';

export default Service.extend(FileSaverMixin, {
  ajax: inject(),
  session: inject(),

  visitReport(requestId) {
    const { access_token } = this.get('session.data.authenticated');
    this.ajax.request(`/api/requests/${requestId}/reports`, {
      method: 'POST',
      dataType: 'binary',
      xhr: () => { // hack to prevent ember-ajax tries to parse the response as JSON. See https://github.com/ember-cli/ember-ajax/issues/321
        const myXhr = $.ajaxSettings.xhr();
        myXhr.responseType = 'arraybuffer';
        return myXhr;
      },
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/pdf'
      }
    }).then((content) => {
      return this.saveFileAs(`bezoekrapport-${requestId}.pdf`, content, 'application/pdf');
    });
  }
});
