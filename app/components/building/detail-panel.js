import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { keepLatestTask } from 'ember-concurrency';
import titleCase from '../../utils/title-case-string';
import constants from '../../config/constants';

const { CUSTOMER_STATUSES } = constants;

export default class BuildingDetailPanelComponent extends Component {
  @service store;

  @tracked editMode;
  @tracked isEnabledDelete;

  constructor() {
    super(...arguments);
    this.editMode = this.args.initialEditMode || false;
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    const count = yield this.store.count('case', {
      'filter[building][:uri:]': this.args.model.uri,
    });
    this.isEnabledDelete = count == 0;
  }

  @keepLatestTask
  *save() {
    const address = yield this.args.model.address;
    if (address.city) {
      address.city = titleCase(address.city);
    }
    const validationResults = yield Promise.all([address.validate(), this.args.model.validate()]);

    const isValid = validationResults.find((v) => v.validations.isInvalid) == null;
    if (isValid) {
      yield address.save();
      yield this.args.model.save();
    }
  }

  @action
  async toggleStatus() {
    if (this.args.model.isActive) {
      this.args.model.status = CUSTOMER_STATUSES.INACTIVE;
    } else {
      this.args.model.status = CUSTOMER_STATUSES.ACTIVE;
    }
    await this.args.model.save();
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
