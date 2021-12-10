import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { guidFor } from '@ember/object/internals';

export default class CalculationLineDetailComponent extends Component {
  @tracked editMode = false;

  constructor() {
    super(...arguments);
    this.editMode = this.args.initialEditMode;
  }

  get fieldId() {
    return guidFor(this);
  }

  @task
  *save() {
    const { validations } = yield this.args.model.validate();
    if (validations.isValid) {
      yield this.args.model.save();
    }
  }

  @action
  openEdit() {
    this.editMode = true;
  }

  @action
  closeEdit() {
    if (this.args.model.hasDirtyAttributes) {
      this.args.model.rollbackAttributes();
    }
    this.editMode = false;
  }
}
