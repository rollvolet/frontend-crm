import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { warn } from '@ember/debug';
import { task } from 'ember-concurrency';
import { compare } from '@ember/utils';

export default class InvoiceWorkingHoursModalComponent extends Component {
  @service store;

  @tracked workingHours = [];
  @tracked newWorkingHourDate;
  @tracked newWorkingHourTechnician = null;

  get sortedWorkingHours() {
    return this.args.model.technicalWorkActivities.sort((a, b) => compare(a.date, b.date));
  }

  get defaultDate() {
    return this.sortedWorkingHours[this.sortedWorkingHours.length - 1]?.date || new Date();
  }

  get isDisabledAddWorkingHour() {
    return this.newWorkingHourDate == null || this.newWorkingHourTechnician == null;
  }

  @task
  *addWorkingHour() {
    const workingHour = this.store.createRecord('technical-work-activity', {
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
