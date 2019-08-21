import Component from '@ember/component';
import DebouncedSearch from '../mixins/debounced-search-task';
import { observer } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Component.extend(DebouncedSearch, {
  classNames: ['invoices-table'],

  store: service(),

  init() {
    this._super(...arguments);
    this.set('invoices', []);
  },

  didReceiveAttrs() {
    this.search.perform();
  },

  page: 0,
  size: 10,
  sort: '-number',
  onClickRow: null,
  dataTableParamChanged: observer('page', 'size', 'sort', function() { // eslint-disable-line ember/no-observers
    this.search.perform();
  }),
  search: task(function * () {
    const invoices = yield this.store.query('invoice', {
      page: {
        size: this.size,
        number: this.page
      },
      sort: this.sort,
      include: 'building'
    });
    this.set('invoices', invoices);
  })
});
