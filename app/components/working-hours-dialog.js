import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import { tagName } from '@ember-decorators/component';
import { action } from '@ember/object';
import { warn } from '@ember/debug';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { filterBy, sort } from '@ember/object/computed';

@classic
@tagName('')
export default class WorkingHoursDialog extends Component {
  @service store

  workingHourSort = Object.freeze(['date'])

  @filterBy('model.workingHours', 'isNew', false) savedWorkingHours
  @sort('savedWorkingHours', 'workingHourSort') sortedWorkingHours

  async didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    if (this.show)
      await this._initNewWorkingHour();
    else if (this.newWorkingHour)
      this.newWorkingHour.destroyRecord();
  }

  @task(function * () {
    const { validations } = yield this.newWorkingHour.validate();

    if (validations.isValid) {
      try {
        yield this.newWorkingHour.save();
        yield this._initNewWorkingHour();
      } catch (e) {
        warn(`Something went wrong while saving working hour for invoice ${this.model.id}`, { id: 'save-failure' });
      }
    }
  }).keepLatest()
  save;

  async _initNewWorkingHour() {
    const invoice = await this.model;
    const date = this.sortedWorkingHours.length ? this.sortedWorkingHours[this.sortedWorkingHours.length - 1].date : new Date();
    const workingHour = this.store.createRecord('working-hour', {
      date,
      invoice
    });
    this.set('newWorkingHour', workingHour);
  }

  @action
  close() {
    this.set('show', false);
  }

  @action
  async remove(workingHour) {
    const workingHours = await this.model.workingHours;
    workingHours.removeObject(workingHour);
    workingHour.destroyRecord();
  }

}
