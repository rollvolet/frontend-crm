import classic from 'ember-classic-decorator';
import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import { task } from 'ember-concurrency';

@classic
export default class ExportsController extends Controller.extend(DefaultQueryParams) {
  size = 10;
  sort = '-date';
  isInvoicesExpanded = false;
  isHistoryExpanded = true;

  @task(function * (accountancyExport) {
    yield accountancyExport.save();
    this.send('refreshModel');
    this.set('isInvoicesExpanded', false);
    this.set('isHistoryExpanded', true);
  })
  onExport;
}
