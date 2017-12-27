import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';

export default Controller.extend(DefaultQueryParams, {
  size: 25,
  sort: '-request-date',
  actions: {
    clickRow(row) {
      console.log('Click row not implemented yet');
    }
  }
});
