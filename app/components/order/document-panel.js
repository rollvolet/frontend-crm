import Component from '@glimmer/component';
import { action } from '@ember/object';
import { warn } from '@ember/debug';
import { task } from 'ember-concurrency';
import generateDocument from '../../utils/generate-document';
import previewDocument from '../../utils/preview-document';
import constants from '../../config/constants';

const { FILE_TYPES } = constants;

export default class OrderDocumentPanelComponent extends Component {
  @task
  *generateOrderDocument() {
    try {
      yield generateDocument(`/orders/${this.args.model.id}/documents`, {
        record: this.args.model,
      });
    } catch (e) {
      warn(`Something went wrong while generating the order document`, {
        id: 'document-generation-failure',
      });
    }
  }

  @task
  *generateDeliveryNote() {
    try {
      yield generateDocument(`/orders/${this.args.model.id}/delivery-notes`, {
        record: this.args.model,
      });
    } catch (e) {
      warn(`Something went wrong while generating the delivery note`, {
        id: 'document-generation-failure',
      });
    }
  }

  @action
  downloadOrderDocument() {
    previewDocument(FILE_TYPES.ORDER, this.args.model.uri);
  }

  @action
  downloadDeliveryNote() {
    previewDocument(FILE_TYPES.DELIVERY_NOTE, this.args.model.uri);
  }
}
