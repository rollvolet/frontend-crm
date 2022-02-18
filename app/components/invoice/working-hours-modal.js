import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { warn } from '@ember/debug';
import { task } from 'ember-concurrency';

export default class InvoiceWorkingHoursModalComponent extends Component {
  @service store;

  @tracked newWorkingHourDate;
  @tracked newWorkingHourTechnician = null;

  constructor() {
    super(...arguments);
    this.newWorkingHourDate = this.defaultDate;
  }

  get sortedWorkingHours() {
    return this.args.model.workingHours.sortBy('date');
  }

  get defaultDate() {
    return this.sortedWorkingHours.get('lastObject.date') || new Date();
  }

  get isDisabledAddWorkingHour() {
    return this.newWorkingHourDate == null || this.newWorkingHourTechnician == null;
  }

  @task
  *addWorkingHour() {
    const workingHour = this.store.createRecord('working-hour', {
      date: this.newWorkingHourDate,
      employee: this.newWorkingHourTechnician,
      invoice: this.args.model,
    });

    const { validations } = yield workingHour.validate();
    if (validations.isValid) {
      try {
        yield workingHour.save();

        // reset form to create new working hour
        this.newWorkingHourDate = this.defaultDate;
        this.newWorkingHourTechnician = null;
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
