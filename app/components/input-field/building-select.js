import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency-decorators';

export default class BuildingSelect extends Component {
  @service store

  @tracked options = []

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    if (this.args.customer) {
      // By using query we force ember-data to reload the relationship.
      // Ember data may otherwise assume it has already loaded the relation when it only fetched 1 page
      this.options = yield this.store.query('building', {
        page: { size: 1000 },
        filter: {
          customer: {
            number: this.args.customer.number
          }
        }
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
