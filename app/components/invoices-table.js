import Component from '@glimmer/component';
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';

export default class InvoicesTable extends Component {
  @service store;

  @tracked invoices = []

  constructor() {
    super(...arguments);
    this.filter = EmberObject.create();
    this.filter.set('page', 0);
    this.filter.set('size', this.args.size || 10);
    this.filter.set('sort', '-number');

    // Setup observers for 2-way binded values of ember-data-table
    this.filter.addObserver('page', this, 'onDataTableParamChange'); // eslint-disable-line ember/no-observers
    this.filter.addObserver('size', this, 'onDataTableParamChange'); // eslint-disable-line ember/no-observers
    this.filter.addObserver('sort', this, 'onDataTableParamChange'); // eslint-disable-line ember/no-observers
    this.search.perform();
  }

  onDataTableParamChange() {
    this.search.perform();
  }

  willDestroy() {
    this.filter.removeObserver('page', this, 'onDataTableParamChange');
    this.filter.removeObserver('size', this, 'onDataTableParamChange');
    this.filter.removeObserver('sort', this, 'onDataTableParamChange');
  }

  onClickRow = null;

  @restartableTask
  *search() {
    this.invoices = yield this.store.query('invoice', {
      page: {
        size: this.filter.size,
        number: this.filter.page
      },
      sort: this.filter.sort,
      include: 'building'
    });
  }
}
