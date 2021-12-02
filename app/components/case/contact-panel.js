import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { later } from '@ember/runloop';
import { keepLatestTask } from 'ember-concurrency-decorators';

export default class CaseContactPanelComponent extends Component {
  @tracked isOpenEditModal = false;
  @tracked showModalContent = false;

  @keepLatestTask
  *save() {
    const { validations } = yield this.args.model.validate();
    if (validations.isValid) yield this.args.model.save();
  }

  @action
  openEditModal() {
    this.isOpenEditModal = true;
    this.showModalContent = true;
  }

  @action
  closeEditModal() {
    this.showModalContent = false;
    later(
      this,
      function () {
        this.isOpenEditModal = false;
      },
      200
    ); // delay to finish leave CSS animation
  }
}
