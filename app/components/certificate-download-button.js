import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  documentGeneration: service(),

  tagName: 'span',
  classNames: ['certificate-download'],

  invoice: null,
  tooltip: 'BTW attest bekijken',

  click() {
    this.documentGeneration.downloadCertificate(this.invoice);
  }
});
