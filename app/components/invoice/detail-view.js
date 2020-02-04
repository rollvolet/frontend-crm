import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class InvoiceDetailViewComponent extends Component {
  @service documentGeneration

  @tracked workingHours = []
  @tracked showWorkingHoursDialog = false

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @(task(function * () {
    this.workingHours = yield this.args.model.load('workingHours');
  }).keepLatest())
  loadData

  get employeeFirstNames() {
    return this.workingHours
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
