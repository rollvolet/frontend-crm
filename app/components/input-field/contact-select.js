import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import { compare } from '@ember/utils';
import { action } from '@ember/object';
import search from '../../utils/mu-search';
import printName from '../../utils/customer-entity-print-name';
import fullAddress from '../../helpers/full-address';
import constants from '../../config/constants';

const { CUSTOMER_STATUSES } = constants;

function searchName(contact) {
  const name = `[${contact.position}] ${printName(contact)}`;
  if (contact.street || contact.postalCode || contact.city) {
    return `${name} (${fullAddress(contact)})`;
  } else {
    return name;
  }
}

export default class InputFieldContactSelectComponent extends Component {
  @service store;

  @tracked options = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    if (this.args.customer) {
      const customers = yield search('customers', 0, 1, 'number', {
        ':uri:': this.args.customer.uri,
        status: CUSTOMER_STATUSES.ACTIVE,
      });
      const customer = customers.content[0];
      if (customer && customer.contacts) {
        const contacts = Array.isArray(customer.contacts) ? customer.contacts : [customer.contacts];
        this.options = contacts
          .map((contact) => {
            return Object.assign({}, contact, {
              searchName: searchName(contact),
            });
          })
          .sort((a, b) => compare(a.position, b.position));
      } else {
        this.options = [];
      }
    }
  }

  get selectedOption() {
    return this.args.value && this.options.find((opt) => opt.uuid == this.args.value.id);
  }

  get required() {
    return this.args.required || false;
  }

  get placeholder() {
    return this.required ? `${this.args.label} *` : this.args.label;
  }

  @action
  async selectOption(contact) {
    if (contact) {
      const record = await this.store.findRecord('contact', contact.uuid);
      this.args.onSelectionChange(record);
    } else {
      this.args.onSelectionChange(null);
    }
  }
}
