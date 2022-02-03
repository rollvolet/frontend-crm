import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

const digitsOnly = /\D/g;

export default class TelephoneTableRowComponent extends Component {
  @tracked editMode = false;

  constructor() {
    super(...arguments);
    this.editMode = this.args.model.initialEditMode;
  }

  get formattedValue() {
    return this.args.model.value; // TODO add auto formatting?
  }

  @action
  setValue(event) {
    const value = event.target.value?.replace(digitsOnly, '');
    this.args.model.value = value;
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
}
