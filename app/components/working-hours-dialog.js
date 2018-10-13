import { warn } from '@ember/debug';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { filterBy } from '@ember/object/computed';

export default Component.extend({
  store: service(),

  tagName: '',
  show: false,
  model: null,

  savedWorkingHours: filterBy('model.workingHours', 'isNew', false),

  async didReceiveAttrs() {
    this._super(...arguments);
    if (this.show)
      await this._initNewWorkingHour();
    else if (this.newWorkingHour)
      this.newWorkingHour.destroyRecord();
  },

  willDestroyElement() {
    if (this.newWorkingHour)
      this.newWorkingHour.destroyRecord();
  },

  save: task(function * () {
    const { validations } = yield this.newWorkingHour.validate();

    if (validations.isValid) {
      try {
        yield this.newWorkingHour.save();
        yield this._initNewWorkingHour();
      } catch (e) {
        warn(`Something went wrong while saving working hour for invoice ${this.model.id}`, { id: 'save-failure' });
      }
    }
  }).keepLatest(),

  async _initNewWorkingHour() {
    const invoice = await this.model;
    const workingHour = this.store.createRecord('working-hour', {
      date: new Date(),
      invoice
    });
    this.set('newWorkingHour', workingHour);
  },

  actions: {
    close() {
      this.set('show', false);
    },
    async remove(workingHour) {
      const workingHours = await this.model.workingHours;
      workingHours.removeObject(workingHour);
      workingHour.destroyRecord();
    }
  }
});
