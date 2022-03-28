import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debug } from '@ember/debug';
import { keepLatestTask, task } from 'ember-concurrency';
import { setCalendarEventProperties } from '../../utils/calendar-helpers';

export default class OfferDetailPanelComponent extends Component {
  @service case;
  @service store;

  @tracked editMode = false;
  @tracked calendarEvent;

  constructor() {
    super(...arguments);
    this.editMode = this.args.initialEditMode || false;
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    // TODO fetch via relation once request is converted to triplestore
    this.calendarEvent = yield this.store.queryOne('calendar-event', {
      'filter[:exact:request]': this.request.uri,
    });
  }

  get request() {
    return this.case.current && this.case.current.request;
  }

  get invoice() {
    return this.case.current && this.case.current.invoice;
  }

  get visitor() {
    return this.case.visitor;
  }

  @task
  *save() {
    const { validations } = yield this.args.model.validate();
    let requiresOrderReload = false;
    if (validations.isValid) {
      const changedAttributes = this.args.model.changedAttributes();
      const fieldsToSyncWithInvoice = ['reference', 'comment'];
      for (let field of fieldsToSyncWithInvoice) {
        if (changedAttributes[field]) {
          if (this.invoice) {
            debug(`Syncing ${field} of invoice with updated ${field} of offer`);
            this.invoice[field] = this.args.model[field];
            yield this.invoice.save();
          }
          requiresOrderReload = true;
        }
      }
      yield this.args.model.save();

      if (requiresOrderReload) {
        yield this.args.model.belongsTo('order').reload();
      }
    }

    const changedAttributesOnRequest = this.request.changedAttributes();
    if (changedAttributesOnRequest['visitor']) {
      yield this.request.save();
    }
  }

  @keepLatestTask
  *synchronizeCalendarEvent() {
    setCalendarEventProperties(this.calendarEvent, {
      request: this.request,
      customer: this.case.current.customer,
      building: this.case.current.building,
      visitor: this.case.visitor,
    });
    yield this.calendarEvent.save();
  }

  @action
  setVisitor(visitor) {
    this.request.visitor = visitor ? visitor.firstName : null;
  }

  @action
  openEdit() {
    this.editMode = true;
  }

  @action
  closeEdit() {
    this.editMode = false;
  }
}
