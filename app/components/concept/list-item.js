import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class ConceptListItemComponent extends Component {
  @tracked editMode = false;

  @task
  *save(e) {
    e.preventDefault();
    yield this.args.model.save();
    this.editMode = false;
  }

  @action
  updateLabel(e) {
    e.preventDefault();
    this.args.model.label = e.target.value;
    this.args.model.langLabel = [];
  }

  @action
  cancelEdit() {
    this.args.model.rollbackAttributes();
    this.editMode = false;
  }

  @action
  openEdit() {
    this.editMode = true;
  }
}
