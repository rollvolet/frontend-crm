import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task, keepLatestTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class TelephoneTableComponent extends Component {
  @service store;
  @service configuration;

  @tracked telephones = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  get sortedTelephones() {
    return this.telephones.sortBy('position');
  }

  @keepLatestTask
  *loadData() {
    // TODO use this.args.model.telephones once the relation is defined
    const telephones = yield this.store.query('telephone', {
      'filter[:exact:customer]': this.args.model.uri,
      sort: 'position',
      page: { size: 100 },
    });
    this.telephones = telephones.toArray();
  }

  @task
  *addTelephone() {
    const position = this.telephones.length
      ? Math.max(...this.telephones.map((l) => l.position))
      : 0;
    const country = this.configuration.defaultCountry;
    const telephoneType = this.configuration.defaultTelephoneType;
    const telephone = this.store.createRecord('telephone', {
      position: position + 1,
      customer: this.args.model.uri,
      contact: this.args.model.uri,
      building: this.args.model.uri,
      country,
      telephoneType,
    });
    telephone.initialEditMode = true;

    yield this.saveTelephone.perform(telephone);

    this.telephones.pushObject(telephone);
  }

  @task
  *saveTelephone(telephone) {
    const { validations } = yield telephone.validate();
    if (validations.isValid) {
      yield telephone.save();
    }
  }

  @task
  *deleteTelephone(telephone) {
    this.telephones.removeObject(telephone);
    if (!telephone.isDeleted) {
      yield telephone.destroyRecord();
    }
  }
}
