import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { task, all } from 'ember-concurrency';
import { warn } from '@ember/debug';
import { raw, equal, and, isEmpty, not } from 'ember-awesome-macros';

export default class CustomerEntityEditForm extends Component {
  @service
  router;

  @tracked
  showUnsavedChangesDialog = false;

  @tracked
  scope = 'customer'; // one of 'customer', 'contact', 'building'

  get isScopeCustomer() {
    return this.scope == 'customer';
  }

  @computed('args.model.telephones.[]')
  get hasFailedTelephone() {
    return this.args.model.telephones.find(t => t.isNew || t.validations.isInvalid || t.isError) != null;
  }

  @and(isEmpty('args.model.requests'), isEmpty('args.model.invoices'))
  hasNoRequestsOrInvoices;

  @and(isEmpty('args.model.contacts'), isEmpty('args.model.buildings'))
  hasNoContactsOrBuildings;

  @and('hasNoRequestsOrInvoices', 'hasNoContactsOrBuildings')
  isEnabledDelete;

  @not('isEnabledDelete')
  isDisabledDelete;

  @equal('args.model.validations.attrs.vatNumber.error.type', raw('unique-vat-number'))
  isDuplicateVatNumber;

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
  closeUnsavedChangesDialog() {
    this.showUnsavedChangesDialog = false
  }

  @action
  async confirmCloseEdit() {
    this.closeUnsavedChangesDialog();
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
}
