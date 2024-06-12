import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { service } from '@ember/service';

export default class InterventionPanelsComponent extends Component {
  @service router;

  @cached
  get case() {
    return new TrackedAsyncData(this.args.model.case);
  }

  @cached
  get invoice() {
    if (this.case.isResolved) {
      return new TrackedAsyncData(this.case.value.invoice);
    } else {
      return null;
    }
  }

  get hasInvoice() {
    return this.invoice?.isResolved && this.invoice.value != null;
  }

  get isDisabledEdit() {
    return (this.case.isResolved && this.case.value.isCancelled) || this.hasInvoice;
  }
}
