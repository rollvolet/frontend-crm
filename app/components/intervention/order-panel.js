import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { keepLatestTask, task } from 'ember-concurrency';

export default class InterventionOrderPanelComponent extends Component {
  @service documentGeneration;

  @tracked order;
  @tracked isOpenOrderModal = false;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.order = yield this.args.model.origin;
  }

  @task
  *link(order) {
    this.args.model.origin = order;
    yield this.args.model.save();
    this.order = order;
    this.closeOrderModal();
  }

  @task
  *unlink() {
    this.order = null;
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
