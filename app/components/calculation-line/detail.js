import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { guidFor } from '@ember/object/internals';
import { isEmpty } from '@ember/utils';

export default class CalculationLineDetailComponent extends Component {
  @tracked editMode = false;

  constructor() {
    super(...arguments);
    this.editMode = !this.args.isDisabledEdit && (this.args.initialEditMode || this.isEmpty);
  }

  get fieldId() {
    return guidFor(this);
  }

  get isEmpty() {
    return isEmpty(this.args.model.amount) && isEmpty(this.args.model.description);
  }

  get isAmountInvalid() {
    return this.args.isAmountRequired && !this.args.model.amount;
  }

  @task
  *save() {
    const { validations } = yield this.args.model.validate();
    if (validations.isValid) {
      yield this.args.model.save();
      yield this.args.didSave();
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
