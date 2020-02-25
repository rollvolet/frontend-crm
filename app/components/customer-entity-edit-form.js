import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { all } from 'ember-concurrency';
import { keepLatestTask, task } from 'ember-concurrency-decorators';
import { warn } from '@ember/debug';
import { raw, equal, and, isEmpty, not } from 'ember-awesome-macros';

export default class CustomerEntityEditForm extends Component {
  @service router

  @tracked showUnsavedChangesDialog = false
  @tracked scope = 'customer'; // one of 'customer', 'contact', 'building'

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

  @task
  *remove() {
    try {
      const telephones = yield this.args.model.telephones;
      yield all(telephones.map(t => t.destroyRecord()));
      yield this.args.model.destroyRecord();
    } catch (e) {
      warn(`Something went wrong while destroying ${this.scope} ${this.args.model.id}`, { id: 'destroy-failure' });
    } finally {
      this.args.onRemove();
    }
  }

  @task
  *rollbackTree() {
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
  }

  @keepLatestTask
  *save() {
    if (this.scope == 'customer' && this.args.model.name)
      this.args.model.name = this.args.model.name.toUpperCase();

    const { validations } = yield this.args.model.validate();
    if (validations.isValid)
      yield this.args.model.save();
  }

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
    this.showUnsavedChangesDialog = false;
  }

  @action
  confirmCloseEdit() {
    this.closeUnsavedChangesDialog();
    this.rollbackTree.perform();
    this.args.onClose();
  }

  @action
  setPostalCode(code, city) {
    this.args.model.postalCode = code;
    this.args.model.city = city;
  }

  @action
  setIsCompany(isCompany) {
    if (!isCompany)
      this.args.model.vatNumber = null;

    this.args.model.isCompany = isCompany;
    this.save.perform();
  }

  @action
  setAddress(lines) {
    this.args.model.address1 = lines[0];
    this.args.model.address2 = lines[1];
    this.args.model.address3 = lines[2];
  }
}
