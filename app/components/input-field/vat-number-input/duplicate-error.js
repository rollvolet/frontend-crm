import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { keepLatestTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class InputFieldVatNumberInputDuplicateError extends Component {
  @service store;
  @service router;

  @tracked duplicate;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    if (this.args.customer) {
      const duplicate = this.store
        .peekAll('customer')
        .find((c) => c.id != this.args.customer.id && c.vatNumber == this.args.customer.vatNumber);

      if (duplicate) {
        this.duplicate = duplicate;
      } else {
        const duplicates = yield this.store.queryOne('customer', {
          filter: {
            'vat-number': this.args.customer.vatNumber,
          },
        });

        if (duplicates.length) {
          this.duplicate = duplicates[0];
        }
      }
    }
  }
}
