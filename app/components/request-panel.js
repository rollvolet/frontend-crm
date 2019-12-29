import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import { on } from '@ember-decorators/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { warn } from '@ember/debug';
import { not, or, notEmpty } from 'ember-awesome-macros';
import { EKMixin, keyUp } from 'ember-keyboard';

@classic
export default class RequestPanel extends Component.extend(EKMixin) {
  @service
  documentGeneration;

  @service
  router;

  @service
  store;

  model = null;
  editMode = false;
  onOpenEdit = null;
  onCloseEdit = null;
  showUnsavedChangesDialog = false;

  @notEmpty('model.offer.id')
  isDisabledEdit;

  @not('isDisabledEdit')
  isEnabledDelete;

  @notEmpty('model.customer.id')
  isLinkedToCustomer;

  @or(
    'isDisabledEdit',
    notEmpty('model.building.id'),
    notEmpty('model.contact.id')
  )
  isDisabledUnlinkCustomer;

  @computed(
    'model.calendarEvent.{content,isMasteredByAccess,validations.isIsvalid,isError}'
  )
  get hasFailedCalendarEvent() {
    const calendarEvent = this.model.get('calendarEvent');
    const isUpdatableCalendarEvent = calendarEvent && !calendarEvent.get('isMasteredByAccess');
    return isUpdatableCalendarEvent && (
      calendarEvent.get('isNew')
        || calendarEvent.get('validations.isInvalid')
        || calendarEvent.get('isError'));
  }

  @computed('model.visitor')
  get visitor() {
    return this.store.peekAll('employee').find(e => e.firstName == this.model.visitor);
  }

  init() {
    super.init(...arguments);
    this.set('keyboardActivated', true); // required for ember-keyboard
  }

  @task(function * () {
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
  })
  remove;

  @task(function * () {
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
  })
  rollbackTree;

  @(task(function * (_, { forceSuccess = false } = {} ) {
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
  }).keepLatest())
  save;

  @task(function * () {
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
  })
  isValidForClosure;

  @task(function * () {
    this.model.set('customer', null);
    this.model.set('contact', null);
    this.model.set('building', null);
    yield this.save.perform();
    this.router.transitionTo('main.requests.edit', this.model);
  })
  unlinkCustomer;

  // eslint-disable-next-line ember/no-on-calls-in-components
  @on(keyUp('ctrl+alt+KeyU'))
  openEditByShortcut() {
    this.onOpenEdit();
  }

  @action
  openEdit() {
    this.onOpenEdit();
  }

  @action
  async closeEdit() {
    const isValidForClosure = await this.isValidForClosure.perform();
    if (isValidForClosure) {
      this.onCloseEdit();
    } else {
      this.set('showUnsavedChangesDialog', true);
    }
  }

  @action
  async confirmCloseEdit() {
    await this.rollbackTree.perform();
    this.onCloseEdit();
  }

  @action
  generateVisitReport() {
    return this.documentGeneration.visitReport(this.model);
  }

  @action
  linkCustomer() {
    this.router.transitionTo('main.requests.edit.customer', this.model);
  }
}
