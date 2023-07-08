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

    const address = yield this.args.model.address;
    const validationResults = yield Promise.all([
      address.validate(),
      this.args.model.validate(),
    ])

    const isValid = validationResults.find((v) => v.validations.isInvalid) == null;
    if (isValid) {
      yield address.save();
      yield this.args.model.save();
    }
  }

  @action
  openEdit() {
    this.editMode = true;
  }

  @action
  async closeEdit() {
    // rollback invalid values that couldn't be saved and revalidate for consistent state
    const address = await this.args.model.address;
    [address, this.args.model].forEach((record) => {
      record.rollbackAttributes();
      record.validate();
    });
    this.editMode = false;
  }
}
