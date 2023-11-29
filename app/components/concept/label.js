import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { trackedFunction } from 'ember-resources/util/function';

export default class ConceptLabelComponent extends Component {
  @service store;

  conceptData = trackedFunction(this, async () => {
    if (this.args.uri) {
      return await this.store.findRecordByUri('concept', this.args.uri);
    } else {
      return null;
    }
  });

  get label() {
    return this.conceptData.value?.label;
  }
}
