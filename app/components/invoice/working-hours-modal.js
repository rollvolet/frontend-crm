import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { warn } from '@ember/debug';
import { task, keepLatestTask } from 'ember-concurrency';

export default class InvoiceWorkingHoursModalComponent extends Component {
  @service store;

  @tracked workingHours = [];
  @tracked newWorkingHourDate;
  @tracked newWorkingHourTechnician = null;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    // TODO use this.args.model.technicalWorkActivities once the relation is defined
    this.workingHours = yield this.store.query('technical-work-activity', {
      'filter[:exact:invoice]': this.args.model.uri,
      sort: 'date',
      page: { size: 100 },
    });
    this.newWorkingHourDate = this.defaultDate;
  }

  get sortedWorkingHours() {
    // TODO once this.args.model.technicalWorkActivities, the relation can be directly
    // returned here instead of being loaded in loadData()
    return this.workingHours;
  }

  get defaultDate() {
    return this.sortedWorkingHours.get('lastObject.date') || new Date();
  }

  get isDisabledAddWorkingHour() {
    return this.newWorkingHourDate == null || this.newWorkingHourTechnician == null;
  }

  @task
  *addWorkingHour() {
    const workingHour = this.store.createRecord('technical-work-activity', {
      date: this.newWorkingHourDate,
      // TODO use this.args.model once the relation is defined
      invoice: this.args.model.uri,
      employee: this.newWorkingHourTechnician,
    });

    const { validations } = yield workingHour.validate();
    if (validations.isValid) {
      try {
        yield workingHour.save();

        // reset form to create new working hour
        this.newWorkingHourDate = this.defaultDate;
        this.newWorkingHourTechnician = null;

        // TODO remove once this.args.model.technicalWorkActivities is used
        this.loadData.perform();
      } catch (e) {
        warn(`Something went wrong while saving working hour for invoice ${this.model.id}`, {
          id: 'save-failure',
        });
      }
    }
  }

  @task
  *deleteWorkingHour(workingHour) {
    yield workingHour.destroyRecord();
  }
}
