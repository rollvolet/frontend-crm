import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency';

export default class CaseContactPanelComponent extends Component {
  @service store;

  @tracked isOpenEditModal = false;
  @tracked telephones = [];
  @tracked emails = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    const [telephones, emails] = yield Promise.all([
      // TODO use this.args.model.telephones once the relation is defined
      this.store.query('telephone', {
        'filter[:exact:contact]': this.args.model.uri,
        sort: 'position',
        page: { size: 100 },
      }),
      // TODO use this.args.model.emails once the relation is defined
      this.store.query('email', {
        'filter[:exact:contact]': this.args.model.uri,
        sort: 'value',
        page: { size: 100 },
      }),
    ]);
    this.telephones = telephones.toArray();
    this.emails = emails.toArray();
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
