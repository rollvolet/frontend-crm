import Component from '@glimmer/component';
import { all, task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class InvoicePanelsComponent extends Component {
  @service store;

  get isDisabledEdit() {
    return this.args.model.isMasteredByAccess;
  }

  @task
  *updateInvoicelinesVatRate(vatRate) {
    // TODO use this.args.model.invoicelines once the relation is defined
    const invoicelines = yield this.store.query('invoiceline', {
      'filter[invoice]': this.args.model.url,
      sort: 'sequence-number',
      page: { size: 100 },
    });
    yield all(
      invoicelines.map((invoiceline) => {
        invoiceline.vatRate = vatRate;
        return invoiceline.save();
      })
    );
  }
}
