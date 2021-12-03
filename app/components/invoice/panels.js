import Component from '@glimmer/component';
import { all, task } from 'ember-concurrency';

export default class InvoicePanelsComponent extends Component {
  get isDisabledEdit() {
    return this.args.model.isMasteredByAccess;
  }

  get isEnabledDelete() {
    return false;
  }

  @task
  *updateInvoicelinesVatRate(vatRate) {
    const invoicelines = yield this.args.model.invoicelines;
    yield all(
      invoicelines.map((invoiceline) => {
        invoiceline.vatRate = vatRate;
        return invoiceline.save();
      })
    );
  }
}
