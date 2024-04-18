import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { cached, tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { singularize } from 'ember-inflector';
import { muSearchOne as searchOne } from '../../utils/mu-search';

export default class AccountancyExportWarningComponent extends Component {
  @service store;

  @tracked isOpenBookingConfirmationModal = false;

  @cached
  get invoice() {
    return new TrackedAsyncData(
      searchOne(this.args.invoice.type, { ':id:': this.args.invoice.id })
    );
  }

  @action
  openBookingConfirmationModal() {
    this.isOpenBookingConfirmationModal = true;
  }

  @action
  cancelBookingConfirmation() {
    this.isOpenBookingConfirmationModal = false;
  }

  @task
  *confirmBooking() {
    const modelName = singularize(this.args.invoice.type);
    const record = yield this.store.findRecord(modelName, this.args.invoice.id);
    yield this.args.onBookInvoice(record);
    this.isOpenBookingConfirmationModal = false;
  }
}
