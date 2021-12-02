import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class InvoicelineDetailComponent extends Component {
  @tracked editMode = false;

  constructor() {
    super(...arguments);
    this.editMode = this.args.model.isNew;
  }

  get isDisabledEdit() {
    return this.args.isDisabledEditDescription && this.args.isDisabledEditPrice;
  }

  get editPriceMode() {
    return !this.args.isDisabledEditPrice && this.editMode;
  }

  get editDescriptionMode() {
    return !this.args.isDisabledEditDescription && this.editMode;
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
  openEdit() {
    this.editMode = true;
  }

  @action
  closeEdit() {
    this.editMode = false;
  }
}
