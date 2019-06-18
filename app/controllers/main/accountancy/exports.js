import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';

export default Controller.extend(DefaultQueryParams, {
  size: 10,
  sort: '-date'
});
