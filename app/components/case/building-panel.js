import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { later } from '@ember/runloop';
import { keepLatestTask } from 'ember-concurrency';

export default class CaseBuildingPanelComponent extends Component {
  @service store;

  @tracked isOpenEditModal = false;
  @tracked showModalContent = false;
  @tracked telephones = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    // TODO use this.args.model.telephones once the relation is defined
    const telephones = yield this.store.query('telephone', {
      'filter[:exact:building]': this.args.model.uri,
      sort: 'position',
      page: { size: 100 },
    });
    this.telephones = telephones.toArray();
  }

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
