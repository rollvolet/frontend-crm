import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency';
import titleCase from '../../utils/title-case-string';

export default class CaseContactPanelComponent extends Component {
  @service store;

  @tracked isOpenEditModal = false;

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
  openEditModal() {
    this.isOpenEditModal = true;
  }

  @action
  closeEditModal() {
    this.isOpenEditModal = false;
  }
}
