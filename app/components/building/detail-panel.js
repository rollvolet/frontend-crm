import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { keepLatestTask } from 'ember-concurrency';

export default class BuildingDetailPanelComponent extends Component {
  @tracked editMode = false;

  @keepLatestTask
  *save() {
    const { validations } = yield this.args.model.validate();
    if (validations.isValid) yield this.args.model.save();
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
