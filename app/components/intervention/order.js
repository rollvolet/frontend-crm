import Component from '@glimmer/component';
import { task, keepLatestTask } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class InterventionOrderComponent extends Component {
  @service documentGeneration

  @tracked order
  @tracked isLinking = false

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
  }

  @task
  *unlink() {
    this.order = null;
    this.args.model.origin = null;
    yield this.args.model.save();
  }

  @action
  enableLinking() {
    this.isLinking = true;
  }

  @action
  disableLinking() {
    this.isLinking = false;
  }

  @action
  downloadProductionTicket() {
    this.documentGeneration.downloadProductionTicket(this.order, { watermark: true });
  }
}
