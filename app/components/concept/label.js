import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class ConceptLabelComponent extends Component {
  @service store;

  @cached
  get concept() {
    if (this.args.uri) {
      return new TrackedAsyncData(this.store.findRecordByUri('concept', this.args.uri));
    } else {
      return null;
    }
  }

  get label() {
    return this.concept.isResolved && this.concept.value?.label;
  }
}
