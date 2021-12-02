import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import { warn } from '@ember/debug';

export default class OrderDocumentPanelComponent extends Component {
  @service documentGeneration;

  @task
  *generateOrderDocument() {
    try {
      yield this.documentGeneration.orderDocument(this.args.model);
    } catch (e) {
      warn(`Something went wrong while generating the order document`, {
        id: 'document-generation-failure',
      });
    }
  }

  @task
  *generateDeliveryNote() {
    try {
      yield this.documentGeneration.deliveryNote(this.args.model);
    } catch (e) {
      warn(`Something went wrong while generating the delivery note`, {
        id: 'document-generation-failure',
      });
    }
  }

  @action
  downloadOrderDocument() {
    this.documentGeneration.downloadOrderDocument(this.args.model);
  }

  @action
  downloadDeliveryNote() {
    this.documentGeneration.downloadDeliveryNote(this.args.model);
  }
}
