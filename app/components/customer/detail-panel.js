import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { keepLatestTask } from 'ember-concurrency-decorators';
import { isBlank } from '@ember/utils';

export default class CustomerDetailPanelComponent extends Component {
  @tracked editMode = false;
  @tracked isMemoExpanded = false;
  @tracked tags = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
    this.editMode = isBlank(this.args.model.name);
  }

  @keepLatestTask
  *loadData() {
    this.tags = yield this.args.model.tags;
  }

  get isScopeCustomer() {
    return this.args.scope == 'customer';  // one of 'customer', 'contact', 'building'
  }

  get joinedTagNames() {
    return this.tags.map(t => t.name).join(', ');
  }

  get isDuplicateVatNumber() {
    const error = this.args.model.validations.attrs.vatNumber.error;
    return error && error.type == 'unique-vat-number';
  }

  @keepLatestTask
  *save() {
    if (this.args.scope == 'customer' && this.args.model.name)
      this.args.model.name = this.args.model.name.toUpperCase();

    const { validations } = yield this.args.model.validate();
    if (validations.isValid)
      yield this.args.model.save();
  }

  @action
  setCustomerType(event) {
    this.args.model.isCompany = event.target.value == 'company';
    if (!this.args.model.isCompany)
      this.args.model.vatNumber = null;
  }

  @action
  setAddress(lines) {
    this.args.model.address1 = lines[0];
    this.args.model.address2 = lines[1];
    this.args.model.address3 = lines[2];
  }

  @action
  setPostalCode(code, city) {
    this.args.model.postalCode = code;
    this.args.model.city = city;
  }

  @action
  toggleMemo() {
    this.isMemoExpanded = !this.isMemoExpanded;
  }

  @action
  openEdit() {
    this.editMode = true;
  }

  @action
  closeEdit() {
    this.editMode = false;
  }
}
