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
  *save() {
    this.editMode = false;
    yield this.args.onSave(this.args.value);
  }

  @action
  openEditMode() {
    this.editMode = true;
  }

  @action
  closeEditMode() {
    this.editMode = false;
  }

  @action
  async cancelEditMode() {
    await this.args.onCancel();
    this.editMode = false;
  }
}
