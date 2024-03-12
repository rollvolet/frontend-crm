import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class ConceptListItemNewComponent extends Component {
  @tracked editMode = false;
  @tracked label;

  get isValid() {
    return isPresent(this.label);
  }

  @task
  *save(e) {
    e.preventDefault();
    yield this.args.onCreate(this.label);
    this.editMode = false;
  }

  @action
  cancelEdit() {
    this.label = null;
    this.editMode = false;
  }

  @action
  openEdit() {
    this.label = null;
    this.editMode = true;
  }
}
