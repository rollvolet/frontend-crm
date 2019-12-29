import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import { or, isEmpty } from 'ember-awesome-macros';

@classic
export default class PostalCodeSelect extends Component {
  @service
  store;

  @or(isEmpty('newCode'), isEmpty('newCity'))
  isAddOptionDisabled;

  init() {
    super.init(...arguments);
    const postalCodes = this.store.peekAll('postal-code');
    this.set('postalCodes', postalCodes);
    this.set('options', this.postalCodes.slice(0, this.size));
  }

  didInsertElement() {
    super.didInsertElement(...arguments);
    if (this.postalCode && this.city) {
      const value = this.postalCodes.find(o => o.code == this.postalCode && o.name == this.city.toUpperCase());

      if (value) {
        this.set('value', value);
      } else {
        const postalCode = this.store.createRecord('postal-code', {
          code: this.postalCode,
          name: this.city.toUpperCase()
        });
        this.set('value', postalCode);
      }
    }
  }

  @(task(function* (term) {
    yield timeout(100);
    return this.postalCodes.filter(p => p.search.toLowerCase().includes(term)).slice(0, this.size);
  }).keepLatest())
  search;

  label = 'Gemeente';
  value = null;
  postalCode = null;
  city = null;
  onSelectionChange = null;
  size = 50;
  titleize = false;

  @action
  selectValue(value) {
    this.set('value', value);
    if (value)
      this.onSelectionChange(value.code, value.name);
    else
      this.onSelectionChange(undefined, undefined);
  }

  @action
  addOption() {
    const postalCode = this.store.createRecord('postal-code', {
      code: this.newCode,
      name: this.newCity.toUpperCase()
    });
    this.set('value', postalCode);
    this.onSelectionChange(postalCode.code, postalCode.name);
    this.set('showCreateModal', false);
    this.set('newCode', null);
    this.set('newCity', null);
  }
}
