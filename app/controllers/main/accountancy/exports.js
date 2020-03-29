import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class ExportsController extends Controller.extend(DefaultQueryParams) {
  size = 10;
  sort = '-date';

  @tracked isInvoicesExpanded = false
  @tracked isHistoryExpanded = true

  @task
  *onExport(accountancyExport) {
    yield accountancyExport.save();
    this.send('refreshModel');
    this.isInvoicesExpanded = false;
    this.isHistoryExpanded = true;
  }
}
