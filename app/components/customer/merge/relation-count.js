import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import sum from '../../../utils/math/sum';

export default class CustomerMergeRelationCountComponent extends Component {
  @service store;

  @tracked counts = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.counts = yield Promise.all(
      [this.args.left, this.args.right].map((customer) => {
        // e.g. case.request becomes 'filter[case][customer][:uri:]'
        const path = this.args.relation.split('.');
        const filterPath = path
          .slice(0, path.length - 1)
          .map((p) => `[${p}]`)
          .join('');
        const filterKey = `filter${filterPath}[customer][:uri:]`;
        const modelName = path.pop();
        return this.store.count(modelName, {
          [filterKey]: customer.uri,
        });
      })
    );
  }

  get total() {
    return sum(this.counts);
  }
}
