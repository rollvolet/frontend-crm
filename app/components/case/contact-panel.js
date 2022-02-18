import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency';

export default class CaseContactPanelComponent extends Component {
  @service store;

  @tracked isOpenEditModal = false;
  @tracked telephones = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    // TODO use this.args.model.telephones once the relation is defined
    const telephones = yield this.store.query('telephone', {
      'filter[contact]': this.args.model.uri,
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
  }

  @action
  closeEditModal() {
    this.isOpenEditModal = false;
  }
}
