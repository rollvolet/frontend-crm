import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { fetchDocumentBlob, previewBlob } from '../../utils/preview-document';
import constants from '../../config/constants';

const { FILE_TYPES } = constants;

export default class InterventionOrderPanelComponent extends Component {
  @tracked isOpenOrderModal = false;

  @cached
  get order() {
    return new TrackedAsyncData(this.args.model.origin);
  }

  @cached
  get originCase() {
    if (this.hasOrder) {
      return new TrackedAsyncData(this.order.value.case);
    } else {
      return null;
    }
  }

  get hasOrder() {
    return this.order.isResolved && this.order.value != null;
  }

  @task
  *link(order) {
    this.args.model.origin = order;
    yield this.args.model.save();
    this.closeOrderModal();
  }

  @task
  *unlink() {
    this.args.model.origin = null;
    yield this.args.model.save();
  }

  @action
  async downloadProductionTicket() {
    const blob = await fetchDocumentBlob(FILE_TYPES.PRODUCTION_TICKET, this.originCase.value.uri);
    if (blob) {
      const formData = new FormData();
      formData.append('file', blob);
      const response = await fetch(
        `/cases/${this.originCase.value.id}/watermarked-production-tickets`,
        {
          method: 'POST',
          body: formData,
        }
      );
      if (response.ok) {
        const watermarkedBlob = await response.blob();
        previewBlob(watermarkedBlob);
      }
    }
  }

  @action
  closeOrderModal() {
    this.isOpenOrderModal = false;
  }

  @action
  openOrderModal() {
    this.isOpenOrderModal = true;
  }
}
