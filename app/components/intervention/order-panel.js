import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { trackedFunction } from 'ember-resources/util/function';
import { task } from 'ember-concurrency';
import { fetchDocumentBlob, previewBlob } from '../../utils/preview-document';
import constants from '../../config/constants';

const { FILE_TYPES } = constants;

export default class InterventionOrderPanelComponent extends Component {
  @tracked isOpenOrderModal = false;

  orderData = trackedFunction(this, async () => {
    return await this.args.model.origin;
  });

  get order() {
    return this.orderData.value;
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
    const _originCase = await this.order.case;
    const blob = await fetchDocumentBlob(FILE_TYPES.PRODUCTION_TICKET, _originCase.uri);
    if (blob) {
      const formData = new FormData();
      formData.append('file', blob);
      const response = await fetch(`/cases/${_originCase.id}/watermarked-production-tickets`, {
        method: 'POST',
        body: formData,
      });
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
