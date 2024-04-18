import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency';
import fetch, { Headers } from 'fetch';

export default class AccountancyExportWarningTableComponent extends Component {
  @tracked warnings = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    const response = yield fetch('/accountancy-export-warnings', {
      method: 'GET',
      headers: new Headers({
        Accept: 'application/vnd.api+json',
      }),
    });

    if (response.ok) {
      const json = yield response.json();
      this.warnings = json.data.map((warning) => {
        return {
          invoice: warning.relationships.invoice.data,
          accountancyExport: warning.relationships['accountancy-export'].data,
        };
      });
    } else {
      throw response;
    }
  }

  @action
  async bookInvoice(invoice) {
    invoice.bookingDate = new Date();
    await invoice.save();
    this.loadData.perform();
  }
}
