import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { keepLatestTask } from 'ember-concurrency-decorators';

export default class InputFieldVatNumberInputDuplicateError extends Component {
  @service store;
  @service router;

  @service duplicate;

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
        const duplicates = yield this.store.query('customer', {
          page: { size: 1 },
          filter: {
            'vat-number': this.args.customer.vatNumber,
          },
        });

        if (duplicates.length) {
          this.duplicate = duplicates.firstObject;
        }
      }
    }
  }
}
