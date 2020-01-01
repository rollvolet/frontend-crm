import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { task, all } from 'ember-concurrency';
import { warn } from '@ember/debug';
import { raw, equal, and, isEmpty, not } from 'ember-awesome-macros';

const digitsOnly = /\D/g;

export default class CustomerEntityEditForm extends Component {
  @service
  router;

  @tracked
  showWarningOnLeaveDialog = false;

  @tracked
  scope = 'customer'; // one of 'customer', 'contact', 'building'

  get isScopeCustomer() {
    return this.scope == 'customer';
  }

  @computed('model.telephones.[]')
  get hasFailedTelephone() {
    return this.args.model.telephones.find(t => t.isNew || t.validations.isInvalid || t.isError) != null;
  }

  @and(isEmpty('model.requests'), isEmpty('model.invoices'))
  hasNoRequestsOrInvoices;

  @and(isEmpty('model.contacts'), isEmpty('model.buildings'))
  hasNoContactsOrBuildings;

  @and('hasNoRequestsOrInvoices', 'hasNoContactsOrBuildings')
  isEnabledDelete;

  @not('isEnabledDelete')
  isDisabledDelete;

  @equal('model.validations.attrs.vatNumber.error.type', raw('unique-vat-number'))
  isDuplicateVatNumber;

  @computed('model.vatNumber')
  get formattedVatNumber() {
    const vatNumber = this.args.model.vatNumber;

    if (vatNumber) {
      if (vatNumber.length >= 2) {
        const country = vatNumber.substr(0, 2).toUpperCase();
        let number = vatNumber.substr(2);

        if (country == 'BE') {
          if (!number.startsWith('0'))
            number = `0${number}`;

          if (number.length >= 4)
            number = `${number.substr(0,4)}.${number.substr(4)}`;

          if (number.length >= 8)
            number = `${number.substr(0,8)}.${number.substr(8)}`;
        }

        return `${country} ${number}`;
      } else {
        return vatNumber.toUpperCase();
      }
    } else {
      return null;
    }
  }

  @task(function * () {
    try {
      const telephones = yield this.args.model.telephones;
      yield all(telephones.map(t => t.destroyRecord()));
      yield this.args.model.destroyRecord();
    } catch (e) {
      warn(`Something went wrong while destroying ${this.scope} ${this.args.model.id}`, { id: 'destroy-failure' });
    } finally {
      this.args.onRemove();
    }
  })
  remove;

  @task(function * () {
    this.args.model.rollbackAttributes();
    const rollbackPromises = [];
    const telephones = yield this.args.model.get('telephones');
    telephones.forEach( (telephone) => {
      telephone.rollbackAttributes();
      rollbackPromises.push(telephone.belongsTo('country').reload());
      rollbackPromises.push(telephone.belongsTo('telephoneType').reload());
    });
    rollbackPromises.push(this.args.model.belongsTo('country').reload());
    rollbackPromises.push(this.args.model.belongsTo('language').reload());
    rollbackPromises.push(this.args.model.belongsTo('honorificPrefix').reload());
    yield all(rollbackPromises);
  })
  rollbackTree;

  @(task(function * () {
    const { validations } = yield this.args.model.validate();
    if (validations.isValid)
      yield this.args.model.save();
  }).keepLatest())
  save;

  @action
  close() {
    if (this.args.model.isNew || this.args.model.validations.isInvalid || this.args.model.isError
        || (this.save.last && this.save.last.isError)
        || this.hasFailedTelephone) {
      this.showUnsavedChangesDialog = true;
    } else {
      this.args.onClose();
    }
  }

  @action
  confirmClose() {
    this.rollbackTree.perform();
    this.args.onClose();
  }

  @action
  setPostalCode(code, city) {
    this.args.model.set('postalCode', code);
    this.args.model.set('city', city);
  }

  @action
  setIsCompany(isCompany) {
    if (!isCompany)
      this.args.model.set('vatNumber', null);

    this.args.model.set('isCompany', isCompany);
    this.save.perform();
  }

  @action
  setName(name) {
    if (this.scope == 'customer' && name)
      this.args.model.set('name', name.toUpperCase());
    else
      this.args.model.set('name', name);
  }

  @action
  setVatNumber(formattedVatNumber) {
    let vatNumber = formattedVatNumber;

    if (formattedVatNumber && formattedVatNumber.length >= 2) {
      const country = formattedVatNumber.substr(0, 2);
      const formattedNumber = formattedVatNumber.substr(2);
      const number = formattedNumber.replace(digitsOnly, '');
      vatNumber = `${country}${number}`;
    }

    this.args.model.set('vatNumber', vatNumber);
  }
}
