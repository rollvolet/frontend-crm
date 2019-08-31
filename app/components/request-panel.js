import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { computed } from '@ember/object';
import { not, notEmpty } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import { EKMixin, keyUp } from 'ember-keyboard';

export default Component.extend(EKMixin, {
  documentGeneration: service(),
  router: service(),
  store: service(),

  model: null,
  editMode: false,
  onOpenEdit: null,
  onCloseEdit: null,
  showUnsavedChangesDialog: false,

  isDisabledEdit: notEmpty('model.offer.id'),
  isEnabledDelete: not('isDisabledEdit'),
  isLinkedToCustomer: notEmpty('model.customer.id'),

  hasFailedCalendarEvent: computed('model.calendarEvent.{content,isMasteredByAccess,validations.isIsvalid,isError}', function() {
    const calendarEvent = this.model.get('calendarEvent');
    const isUpdatableCalendarEvent = calendarEvent && !calendarEvent.get('isMasteredByAccess');
    return isUpdatableCalendarEvent && (
      calendarEvent.get('isNew')
        || calendarEvent.get('validations.isInvalid')
        || calendarEvent.get('isError'));
  }),

  visitor: computed('model.visitor', function() {
    return this.store.peekAll('employee').find(e => e.firstName == this.model.visitor);
  }),

  init() {
    this._super(...arguments);
    this.set('keyboardActivated', true); // required for ember-keyboard
  },

  remove: task(function * () {
    const customer = yield this.model.customer;
    try {
      const calendarEvent = yield this.model.calendarEvent;
      if (calendarEvent)
        yield calendarEvent.destroyRecord();
      yield this.model.destroyRecord();
    } catch (e) {
      warn(`Something went wrong while destroying request ${this.model.id}`, { id: 'destroy-failure' });
      // TODO rollback to detail view?
    } finally {
      if (customer)
        this.router.transitionTo('main.customers.edit', customer);
      else
        this.router.transitionTo('main.requests.index');
    }
  }),
  rollbackTree: task( function * () {
    this.model.rollbackAttributes();
    const calendarEvent = yield this.model.calendarEvent;
    if (calendarEvent)
      calendarEvent.rollbackAttributes();

    const rollbackPromises = [];
    rollbackPromises.push(this.model.belongsTo('wayOfEntry').reload());
    // reload of calendarEvent not necessary. We already rollbacked the attributes.
    // rollbackPromises.push(this.model.belongsTo('calendarEvent').reload());
    yield all(rollbackPromises);
    yield this.save.perform(null, { forceSuccess: true });
  }),
  save: task(function * (_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.model.validate();
    if (validations.isValid) {
      if (this.model.changedAttributes()['comment']) {
        yield this.model.save();
        // reload after save so calendar event has been updated
        this.model.belongsTo('calendarEvent').reload();
      } else {
        yield this.model.save();
      }
    }
  }).keepLatest(),
  isValidForClosure: task( function * () {
    if (this.model.isNew || this.model.validations.isInvalid || this.model.isError) {
      return false;
    } else if (this.save.last && this.save.last.isError) {
      return false;
    } else {
      const calendarEvent = yield this.model.calendarEvent;
      if (calendarEvent && !calendarEvent.isMasteredByAccess) {
        if (calendarEvent.isNew || calendarEvent.validations.isInvalid || calendarEvent.isError) {
          return false;
        }
      }
    }
    return true;
  }),
  unlinkCustomer: task(function * () {
    this.model.set('customer', null);
    this.model.set('contact', null);
    this.model.set('building', null);
    yield this.save.perform();
    this.router.transitionTo('main.requests.edit', this.model);
  }),

  // eslint-disable-next-line ember/no-on-calls-in-components
  openEditByShortcut: on(keyUp('ctrl+alt+KeyU'), function() {
    this.onOpenEdit();
  }),

  actions: {
    openEdit() {
      this.onOpenEdit();
    },
    async closeEdit() {
      const isValidForClosure = await this.isValidForClosure.perform();
      if (isValidForClosure) {
        this.onCloseEdit();
      } else {
        this.set('showUnsavedChangesDialog', true);
      }
    },
    async confirmCloseEdit() {
      await this.rollbackTree.perform();
      this.onCloseEdit();
    },
    generateVisitReport() {
      return this.documentGeneration.visitReport(this.model);
    },
    linkCustomer() {
      this.router.transitionTo('main.requests.edit.customer', this.model);
    }
  }
});
