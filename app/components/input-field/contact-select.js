import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import constants from '../../config/constants';

const { CUSTOMER_STATUSES } = constants;

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
      // By using query we force ember-data to reload the relationship.
      // Ember data may otherwise assume it has already loaded the relation when it only fetched 1 page
      this.options = yield this.store.queryAll('contact', {
        sort: 'position',
        filter: {
          customer: {
            ':uri:': this.args.customer.uri,
          },
          status: CUSTOMER_STATUSES.ACTIVE,
        },
        include: 'address',
      });
    }
  }

  get required() {
    return this.args.required || false;
  }

  get placeholder() {
    return this.required ? `${this.args.label} *` : this.args.label;
  }
}
