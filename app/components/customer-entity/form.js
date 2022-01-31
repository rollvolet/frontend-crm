import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CustomerEntityFormComponent extends Component {
  @tracked scope = this.args.scope || 'customer'; // one of 'customer', 'contact', 'building'

  get scopeNoun() {
    if (this.scope == 'contact') {
      return 'het contact';
    } else if (this.scope == 'building') {
      return 'het gebouw';
    } else {
      return 'de klant';
    }
  }

  get isScopeCustomer() {
    return this.scope == 'customer';
  }

  @action
  setCustomerType(event) {
    this.args.model.isCompany = event.target.value == 'company';
    if (!this.args.model.isCompany) {
      this.args.model.vatNumber = null;
    }
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
}
