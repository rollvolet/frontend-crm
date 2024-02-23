import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task, keepLatestTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { compare } from '@ember/utils';
import { TrackedArray } from 'tracked-built-ins';

export default class TelephoneTableComponent extends Component {
  @service store;
  @service codelist;

  @tracked scope = this.args.scope || 'customer'; // one of 'customer', 'contact', 'building'
  @tracked telephones = new TrackedArray([]);

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
    return this.telephones.slice(0).sort((a, b) => compare(a.position, b.position));
  }

  @keepLatestTask
  *loadData() {
    // TODO increase page size [?]
    const telephones = yield this.args.model.telephones;
    this.telephones = new TrackedArray(telephones);
  }

  @task
  *addTelephone() {
    const position = this.telephones.length
      ? Math.max(...this.telephones.map((l) => l.position))
      : 0;
    const country = this.codelist.defaultCountry;
    const telephoneType = this.codelist.defaultTelephoneType;
    const telephone = this.store.createRecord('telephone', {
      position: position + 1,
      [`${this.scope}`]: this.args.model,
      country,
      telephoneType,
    });
    telephone.initialEditMode = true;

    yield this.saveTelephone.perform(telephone);

    this.telephones.push(telephone);
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
    const i = this.telephones.indexOf(telephone);
    if (i >= 0) {
      this.telephones.splice(i, 1);
    }
    if (!telephone.isDeleted) {
      yield telephone.destroyRecord();
    }
  }
}
