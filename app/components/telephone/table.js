import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task, keepLatestTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class TelephoneTableComponent extends Component {
  @service store;
  @service configuration;

  @tracked scope = this.args.scope || 'customer'; // one of 'customer', 'contact', 'building'
  @tracked telephones = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  willDestroy() {
    super.willDestroy(...arguments);
    // Reset dangling edit modes
    this.telephones.forEach((telephone) => delete telephone.initialEditMode);
  }

  get isScopeCustomer() {
    return this.scope == 'customer';
  }

  get sortedTelephones() {
    return this.telephones.sortBy('position');
  }

  @keepLatestTask
  *loadData() {
    const filterKey = `filter[:exact:${this.scope}]`;
    // TODO use this.args.model.telephones once the relation is defined
    const telephones = yield this.store.query('telephone', {
      [filterKey]: this.args.model.uri,
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
      [`${this.scope}`]: this.args.model.uri,
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
