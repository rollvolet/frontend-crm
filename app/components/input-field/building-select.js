import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import { isPresent, compare } from '@ember/utils';
import { action } from '@ember/object';
import search from '../../utils/mu-search';
import printName from '../../utils/customer-entity-print-name';
import constants from '../../config/constants';

const { CUSTOMER_STATUSES } = constants;

function searchName(building) {
  const name = `[${building.position}] ${printName(building)}`;
  if (building.street || building.postalCode || building.city) {
    const fullAddress = [building.street, `${building.postalCode || ''} ${building.city || ''}`]
      .filter((line) => isPresent(line))
      .join(', ');
    return `${name} (${fullAddress})`;
  } else {
    return name;
  }
}

export default class InputFieldBuildingSelectComponent extends Component {
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
      if (customer && customer.buildings) {
        const buildings = Array.isArray(customer.buildings)
          ? customer.buildings
          : [customer.buildings];
        this.options = buildings
          .map((building) => {
            return Object.assign({}, building, {
              searchName: searchName(building),
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
  async selectOption(building) {
    if (building) {
      const record = await this.store.findRecord('building', building.uuid);
      this.args.onSelectionChange(record);
    } else {
      this.args.onSelectionChange(null);
    }
  }
}
