import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';

export default Controller.extend(DefaultQueryParams, {
  size: 25,
  actions: {
    clickRow(row) {
      this.transitionToRoute('main.customers.edit', row);
    }
  }
});
