import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { keepLatestTask } from 'ember-concurrency';
import titleCase from '../../utils/title-case-string';

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
  openEdit() {
    this.editMode = true;
  }

  @action
  closeEdit() {
    this.editMode = false;
  }
}
