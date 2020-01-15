import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class InvoiceDetailPanel extends Component {
  @service documentGeneration

  @tracked showWorkingHoursDialog = false

  get employeeFirstNames() {
    return this.args.model.workingHours
      .filterBy('isNew', false)
      .mapBy('employee')
      .uniqBy('firstName')
      .sortBy('firstName')
      .mapBy('firstName');
  }

  @action
  openWorkingHoursDialog() {
    this.showWorkingHoursDialog = true;
  }

  @action
  async downloadProductionTicket() {
    const order = await this.args.model.order;
    await this.documentGeneration.downloadProductionTicket(order);
  }
}
