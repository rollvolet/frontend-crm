import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { warn } from '@ember/debug';
import { filterBy, mapBy, uniqBy, sort } from '@ember/object/computed';

export default Component.extend({
  documentGeneration: service(),

  model: null,
  showWorkingHoursDialog: false,
  hasCertificateUploadError: false,
  showProductionTicketNotFoundDialog: false,

  employeeSort: Object.freeze(['firstName']),
  savedWorkingHours: filterBy('model.workingHours', 'isNew', false),
  employees: mapBy('savedWorkingHours', 'employee'),
  uniqEmployees: uniqBy('employees', 'firstName'),
  sortedEmployees: sort('uniqEmployees', 'employeeSort'),
  employeeFirstNames: mapBy('sortedEmployees', 'firstName'),

  uploadCertificate: task(function * (file) {
    try {
      this.set('hasCertificateUploadError', false);
      yield this.documentGeneration.uploadCertificate(this.model, file);
      this.model.set('certificateReceived', true);
      yield this.model.save();
    } catch (e) {
      warn(`Error while uploading certificate: ${e.message || JSON.stringify(e)}`, { id: 'failure.upload' } );
      file.queue.remove(file);
      this.model.set('certificateReceived', false);
      this.set('hasCertificateUploadError', true);
    }
  }).enqueue(),

  actions: {
    openWorkingHoursDialog() {
      this.set('showWorkingHoursDialog', true);
    },
    async downloadProductionTicket() {
      const order = await this.model.order;
      const document = await this.documentGeneration.downloadProductionTicket(order);

      if (!document)
        this.set('showProductionTicketNotFoundDialog', true);

    },
    async deleteCertificate() {
      this.model.set('certificateReceived', false);
      await this.model.save();
    }
  }
});
