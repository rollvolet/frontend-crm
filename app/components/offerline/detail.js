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
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    yield this.args.model.calculationLines; // used to show loading state in template
  }

  get showUnsavedWarning() {
    return (
      !this.editMode &&
      (this.args.model.validations.isInvalid ||
        this.args.model.isNew ||
        this.args.model.hasDirtyAttributes)
    );
  }

  @action
  async updateOfferlineAmount() {
    const calculationLines = await this.args.model.calculationLines;
    const totalAmount = sum(calculationLines.map((line) => line.arithmeticAmount));
    this.args.model.amount = totalAmount;
    if (this.args.model.hasDirtyAttributes) {
      await this.args.model.save(); // only save if total amount of offerline has changed
    }
  }

  @task
  *addCalculationLine() {
    const calculationLines = yield this.args.model.calculationLines;
    const position = calculationLines.length
      ? Math.max(...calculationLines.map((l) => l.position))
      : 0;
    const calculationLine = this.store.createRecord('calculation-line', {
      offerline: this.args.model,
      position: position + 1,
    });

    const { validations } = yield calculationLine.validate();
    if (validations.isValid) {
      yield calculationLine.save();
    }

    yield this.updateOfferlineAmount();
  }

  @task
  *deleteCalculationLine(calculationLine) {
    if (!calculationLine.isDeleted) {
      yield calculationLine.destroyRecord();
    }
    yield this.updateOfferlineAmount();
  }

  @task
  *copyOfferline() {
    yield this.args.onCopy();
  }

  @action
  openEdit() {
    this.editMode = true;
  }

  @action
  closeEdit() {
    this.editMode = false;
  }

  @action
  toggleCalculation() {
    this.isShownCalculation = !this.isShownCalculation;
  }
}
