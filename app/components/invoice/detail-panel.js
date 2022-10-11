import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debug } from '@ember/debug';
import { task, keepLatestTask } from 'ember-concurrency';

export default class InvoiceDetailPanelComponent extends Component {
  @service case;
  @service store;
  @service documentGeneration;

  @tracked editMode = false;
  @tracked isOpenWorkingHoursModal = false;
  @tracked workingHours = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    // TODO use this.args.model.technicalWorkActivities once the relation is defined
    const workingHours = yield this.store.query('technical-work-activity', {
      'filter[:exact:invoice]': this.args.model.uri,
      sort: 'date',
      page: { size: 100 },
    });

    this.workingHours = workingHours.toArray();
  }

  get order() {
    return this.case.current && this.case.current.order;
  }

  get technicianNames() {
    return this.workingHours
      .filterBy('isNew', false)
      .mapBy('employee')
      .uniqBy('firstName')
      .sortBy('firstName')
      .mapBy('firstName');
  }

  @task
  *save() {
    const { validations } = yield this.args.model.validate();
    let requiresOfferReload = false;
    if (validations.isValid) {
      const changedAttributes = this.args.model.changedAttributes();
      const fieldsToSyncWithOrder = ['reference', 'comment'];
      for (let field of fieldsToSyncWithOrder) {
        if (changedAttributes[field]) {
          if (this.order) {
            debug(`Syncing ${field} of offer/order with updated ${field} of invoice`);
            this.order[field] = this.args.model[field];
            yield this.order.save();
          }
          requiresOfferReload = true;
        }
      }

      yield this.args.model.save();

      if (this.order && requiresOfferReload) {
        yield this.order.belongsTo('offer').reload();
      }
    }
  }

  @action
  setVatRate(vatRate) {
    this.args.model.vatRate = vatRate;
    this.args.model.certificateRequired = vatRate && vatRate.rate == 6;
    this.args.onChangeVatRate(vatRate);
  }

  @action
  async downloadProductionTicket() {
    const order = await this.args.model.order;
    await this.documentGeneration.downloadProductionTicket(order);
  }

  @action
  openEdit() {
    this.editMode = true;
  }

  @action
  closeEdit() {
    this.editMode = false;
  }

  @action
  openWorkingHoursModal() {
    this.isOpenWorkingHoursModal = true;
  }

  @action
  closeWorkingHoursModal() {
    // TODO remove once this.args.model.technicalWorkActivities is used
    this.loadData.perform();

    this.isOpenWorkingHoursModal = false;
  }
}
