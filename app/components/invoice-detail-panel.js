import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { filterBy, mapBy, uniqBy, sort } from '@ember/object/computed';

export default Component.extend({
  documentGeneration: service(),

  model: null,
  showWorkingHoursDialog: false,
  showProductionTicketNotFoundDialog: false,

  employeeSort: Object.freeze(['firstName']),
  savedWorkingHours: filterBy('model.workingHours', 'isNew', false),
  employees: mapBy('savedWorkingHours', 'employee'),
  uniqEmployees: uniqBy('employees', 'firstName'),
  sortedEmployees: sort('uniqEmployees', 'employeeSort'),
  employeeFirstNames: mapBy('sortedEmployees', 'firstName'),

  actions: {
    openWorkingHoursDialog() {
      this.set('showWorkingHoursDialog', true);
    },
    async downloadProductionTicket() {
      const order = await this.model.order;
      const document = await this.documentGeneration.downloadProductionTicket(order);

      if (!document)
        this.set('showProductionTicketNotFoundDialog', true);
    }
  }
});
