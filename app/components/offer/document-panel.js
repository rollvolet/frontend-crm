import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { warn } from '@ember/debug';

export default class OfferDocumentPanelComponent extends Component {
  @service documentGeneration

  @task
  *generateOfferDocument() {
    try {
      yield this.documentGeneration.offerDocument(this.args.model);
    } catch(e) {
      warn(`Something went wrong while generating the offer document`, { id: 'document-generation-failure' });
    }
  }

  @task
  *saveLine(line) {
    yield line.save();
  }

  @action
  downloadOfferDocument() {
    this.documentGeneration.downloadOfferDocument(this.args.model);
  }

}
