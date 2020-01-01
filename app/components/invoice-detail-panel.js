import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { filterBy, mapBy, uniqBy, sort } from '@ember/object/computed';

@classic
export default class InvoiceDetailPanel extends Component {
  @service documentGeneration

  showWorkingHoursDialog = false
  employeeSort = Object.freeze(['firstName'])

  @filterBy('model.workingHours', 'isNew', false) savedWorkingHours
  @mapBy('savedWorkingHours', 'employee') employees
  @uniqBy('employees', 'firstName') uniqEmployees
  @sort('uniqEmployees', 'employeeSort') sortedEmployees
  @mapBy('sortedEmployees', 'firstName') employeeFirstNames

  @action
  openWorkingHoursDialog() {
    this.set('showWorkingHoursDialog', true);
  }

  @action
  async downloadProductionTicket() {
    const order = await this.model.order;
    await this.documentGeneration.downloadProductionTicket(order);
  }
}
