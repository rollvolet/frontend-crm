import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import { task } from 'ember-concurrency';

export default Controller.extend(DefaultQueryParams, {
  size: 10,
  sort: '-date',

  isInvoicesExpanded: false,
  isHistoryExpanded: true,

  onExport: task(function * (accountancyExport) {
    yield accountancyExport.save();
    this.send('refreshModel');
    this.set('isInvoicesExpanded', false);
    this.set('isHistoryExpanded', true);
  })
});
