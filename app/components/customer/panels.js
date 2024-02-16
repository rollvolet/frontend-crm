import Component from '@glimmer/component';
import { service } from '@ember/service';
import { keepLatestTask, task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { warn } from '@ember/debug';

export default class CustomerPanelsComponent extends Component {
  @service store;

  @tracked isEnabledDelete;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    const counts = yield Promise.all([
      this.store.count('request', {
        'filter[case][customer][:uri:]': this.args.model.uri,
      }),
      this.store.count('intervention', {
        'filter[case][customer][:uri:]': this.args.model.uri,
      }),
      this.store.count('invoice', {
        'filter[case][customer][:uri:]': this.args.model.uri,
      }),
      this.store.count('contact', {
        'filter[customer][:uri:]': this.args.model.uri,
      }),
      this.store.count('building', {
        'filter[customer][:uri:]': this.args.model.uri,
      }),
    ]);

    this.isEnabledDelete = counts.every((count) => count == 0);
  }

  @task
  *delete() {
    try {
      const [address, telephones, emails] = yield Promise.all([
        this.args.model.address,
        this.args.model.telephones,
        this.args.model.emails,
      ]);

      const records = [address, ...telephones.toArray(), ...emails.toArray()].filter((v) => v);
      yield Promise.all(records.map((t) => t.destroyRecord()));
      yield this.args.model.destroyRecord();
    } catch (e) {
      warn(`Something went wrong while destroying customer ${this.args.model.id}`, {
        id: 'destroy-failure',
      });
    } finally {
      this.args.onDidDelete();
    }
  }
}
