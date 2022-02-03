import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task, keepLatestTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import sum from '../../utils/math/sum';

export default class OfferlineDetailComponent extends Component {
  @service store;

  @tracked editMode = false;
  @tracked isShownCalculation = false;

  constructor() {
    super(...arguments);
    this.editMode = this.args.model.initialEditMode;
    this.isShownCalculation = this.args.model.initialEditMode;
  }

  get showUnsavedWarning() {
    return (
      !this.editMode &&
      (this.args.model.validations.isInvalid ||
        this.args.model.isNew ||
        this.args.model.hasDirtyAttributes)
    );
  }

  @keepLatestTask
  *updateOfferlineAmount() {
    const calculationLines = yield this.args.model.calculationLines;
    const totalAmount = sum(calculationLines.map((line) => line.amount));
    this.args.model.amount = totalAmount;
    if (this.args.model.hasDirtyAttributes) {
      yield this.args.model.save(); // only save if total amount of offerline has changed
    }
  }

  @task
  *addCalculationLine() {
    const calculationLine = this.store.createRecord('calculation-line', {
      offerline: this.args.model,
    });

    const { validations } = yield calculationLine.validate();
    if (validations.isValid) {
      yield calculationLine.save();
    }

    this.updateOfferlineAmount.perform();
  }

  @task
  *deleteCalculationLine(calculationLine) {
    if (!calculationLine.isDeleted) {
      yield calculationLine.destroyRecord();
    }
    this.updateOfferlineAmount.perform();
  }

  @action
  openEdit() {
    this.editMode = true;
  }

  @action
  closeEdit() {
    this.editMode = false;
    delete this.args.model.initialEditMode;
  }

  @action
  toggleCalculation() {
    this.isShownCalculation = !this.isShownCalculation;
  }
}
