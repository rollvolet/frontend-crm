import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

const noWhitespace = /\s/g;

export default class EmailTableRowComponent extends Component {
  @tracked editMode = false;

  constructor() {
    super(...arguments);
    this.editMode = this.args.model.initialEditMode;
  }

  @action
  setValue(event) {
    const value = event.target.value?.replace(noWhitespace, '');
    this.args.model.value = value;
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
