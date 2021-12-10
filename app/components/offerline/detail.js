import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import sum from '../../utils/math/sum';

export default class OfferlineDetailComponent extends Component {
  @service store;

  @tracked editMode = false;
  @tracked isShownCalculation = false;
  @tracked calculationLines = [];

  constructor() {
    super(...arguments);
    this.editMode = this.args.model.isNew;
    this.loadData.perform();
  }

  get showUnsavedWarning() {
    return (
      !this.editMode &&
      (this.args.model.validations.isInvalid ||
        this.args.model.isNew ||
        this.args.model.hasDirtyAttributes)
    );
  }

  get totalCalculationAmount() {
    return sum(this.calculationLines.map((line) => line.amount));
  }

  @task
  *loadData() {
    // TODO use this.args.model.calculationLines once the relation is defined
    const calculationLines = yield this.store.query('calculation-line', {
      'filter[offerline]': this.args.model.url,
    });
    this.calculationLines = calculationLines.toArray();
  }

  @task
  *addCalculationLine() {
    const calculationLine = this.store.createRecord('calculation-line', {
      offerline: this.args.model.url,
    });

    const { validations } = yield calculationLine.validate();
    if (validations.isValid) {
      yield calculationLine.save();
    }

    this.calculationLines.pushObject(calculationLine);
  }

  @task
  *deleteCalculationLine(calculationLine) {
    this.calculationLines.removeObject(calculationLine);
    yield calculationLine.destroyRecord();
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
