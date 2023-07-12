import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { trackedFunction } from 'ember-resources/util/function';
import { task } from 'ember-concurrency';

export default class InterventionOrderPanelComponent extends Component {
  @service documentGeneration;

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
  downloadProductionTicket() {
    this.documentGeneration.downloadProductionTicket(this.order, { watermark: true });
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
