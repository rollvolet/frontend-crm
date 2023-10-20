import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { task } from 'ember-concurrency';

export default class InputFieldEditableComponent extends Component {
  @tracked editMode = false;

  get elementId() {
    return `editable-field-${guidFor(this)}`;
  }

  @task
  *save(value) {
    yield this.args.onSave(value);
    this.closeEditMode();
  }

  @task
  *cancel() {
    if (this.args.onCancel) {
      yield this.args.onCancel();
    }
    this.closeEditMode();
  }

  @action
  openEditMode() {
    this.editMode = true;
  }

  @action
  closeEditMode() {
    this.editMode = false;
  }
}
