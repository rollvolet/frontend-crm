import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
import { keepLatestTask } from 'ember-concurrency';

export default class CustomerDetailPanelComponent extends Component {
  @tracked editMode = false;

  constructor() {
    super(...arguments);
    this.editMode = isBlank(this.args.model.name);
  }

  @keepLatestTask
  *save() {
    if (this.args.model.name) {
      this.args.model.name = this.args.model.name.toUpperCase();
    }

    const { validations } = yield this.args.model.validate();
    if (validations.isValid) yield this.args.model.save();
  }

  @action
  openEdit() {
    this.editMode = true;
  }

  @action
  closeEdit() {
    // rollback invalid values that couldn't be saved and revalidate for consistent state
    this.args.model.rollbackAttributes();
    this.args.model.validate();
    this.editMode = false;
  }
}
