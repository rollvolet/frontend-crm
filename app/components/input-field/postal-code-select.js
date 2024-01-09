import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { timeout, keepLatestTask } from 'ember-concurrency';

export default class PostalCodeSelect extends Component {
  @service store;

  @tracked value;
  @tracked postalCodes = [];
  @tracked showCreateModal = false;
  @tracked newCode;
  @tracked newCity;

  constructor() {
    super(...arguments);

    this.postalCodes = this.store.peekAll('postal-code').sortBy('code');

    if (this.args.postalCode && this.args.city) {
      const value = this.postalCodes.find(
        (o) => o.code == this.args.postalCode && o.name == this.args.city.toUpperCase()
      );

      if (value) {
        this.value = value;
      } else {
        const postalCode = this.store.createRecord('postal-code', {
          code: this.args.postalCode,
          name: this.args.city.toUpperCase(),
        });
        this.value = postalCode;
      }
    }
  }

  get required() {
    return this.args.required || false;
  }

  get placeholder() {
    return this.required ? `${this.args.label} *` : this.args.label;
  }

  get size() {
    return this.args.size || 50;
  }

  get isAddOptionDisabled() {
    return isEmpty(this.newCode) || isEmpty(this.newCity);
  }

  get titleize() {
    return this.args.titleize || false;
  }

  get options() {
    return this.postalCodes.slice(0, this.size);
  }

  @keepLatestTask
  *search(term) {
    yield timeout(100);
    return this.postalCodes
      .filter((p) => p.search.toLowerCase().includes(term.toLowerCase()))
      .slice(0, this.size);
  }

  @action
  selectValue(value) {
    this.value = value;
    if (value) {
      this.args.onSelectionChange(value.code, value.name);
    } else {
      this.args.onSelectionChange(undefined, undefined);
    }
  }

  @action
  addOption() {
    const postalCode = this.store.createRecord('postal-code', {
      code: this.newCode,
      name: this.newCity.toUpperCase(),
    });
    this.value = postalCode;
    this.args.onSelectionChange(postalCode.code, postalCode.name);
    this.closeCreateNewModal();
    this.newCode = null;
    this.newCity = null;
  }

  @action
  openCreateNewModal() {
    this.showCreateModal = true;
  }

  @action
  closeCreateNewModal() {
    this.showCreateModal = false;
  }
}
