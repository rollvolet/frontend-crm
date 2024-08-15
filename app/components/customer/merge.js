import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { debug } from '@ember/debug';
import { ExclusivePropertyBlock, MergeablePropertyBlock } from '../../utils/merge-helpers';
import constants from '../../config/constants';

const { CUSTOMER_STATUSES } = constants;

export default class CustomerMergeComponent extends Component {
  @service store;

  @tracked blocks = [];

  constructor() {
    super(...arguments);
    this.blocks = [
      new ExclusivePropertyBlock('name', this.args.left, this.args.right, function () {
        const record = this.acceptedUnit.record;
        return [
          'type',
          'number',
          'honorificPrefix',
          'prefix',
          'name',
          'suffix',
          'printPrefix',
          'printSuffix',
          'printInFront',
        ].map((key) => [key, record[key]]);
      }),
      new ExclusivePropertyBlock('vatNumber', this.args.left, this.args.right),
      new ExclusivePropertyBlock('address', this.args.left, this.args.right),
      new ExclusivePropertyBlock('language', this.args.left, this.args.right),
      new MergeablePropertyBlock('comment', this.args.left, this.args.right),
      new MergeablePropertyBlock('memo', this.args.left, this.args.right),
      new MergeablePropertyBlock('keywords', this.args.left, this.args.right),
      new MergeablePropertyBlock('telephones', this.args.left, this.args.right),
      new MergeablePropertyBlock('emails', this.args.left, this.args.right),
      new ExclusivePropertyBlock('url', this.args.left, this.args.right),
    ];
  }

  findBlock(property) {
    return this.blocks.find((b) => b.property == property);
  }

  get acceptedCustomer() {
    return this.findBlock('name').acceptedUnit.record;
  }

  get rejectedCustomer() {
    return this.findBlock('name').rejectedUnit.record;
  }

  @task
  *merge() {
    debug(`Master record of the merge operation is ${this.acceptedCustomer.id}`);
    debug(`Slave record of the merge operation is ${this.rejectedCustomer.id}`);

    // Update properties of master record to merged state
    const relatedRecordsToSave = [];
    for (const block of this.blocks) {
      if (['telephones', 'emails'].includes(block.property)) {
        // hasMany-relation
        const [[_property, records]] = block.resolve(); // eslint-disable-line no-unused-vars
        for (const record of records) {
          record.customer = this.acceptedCustomer;
          relatedRecordsToSave.push(record);
        }
      } else {
        // regular attribute or belongsTo-relation
        const properties = block.resolve();
        for (const [key, value] of properties) {
          this.acceptedCustomer[key] = value;
        }
      }
    }
    this.acceptedCustomer.status = CUSTOMER_STATUSES.ACTIVE;
    this.acceptedCustomer.modified = new Date();
    yield this.acceptedCustomer.save();
    yield Promise.all(relatedRecordsToSave.map((record) => record.save()));

    // Relink contacts/buildings/cases from slave record to master
    const [contacts, buildings, cases] = yield Promise.all([
      this.store.queryAll('contact', {
        'filter[customer][:id:]': this.rejectedCustomer.id,
      }),
      this.store.queryAll('building', {
        'filter[customer][:id:]': this.rejectedCustomer.id,
      }),
      this.store.queryAll('case', {
        'filter[customer][:id:]': this.rejectedCustomer.id,
      }),
    ]);

    debug('Going to relink resources to the master record');
    yield Promise.all(
      [...contacts.slice(0), ...buildings.slice(0), ...cases.slice(0)].map((record) => {
        record.customer = this.acceptedCustomer;
        debug(`- ${record.constructor.name} ${record.id}`);
        return record.save();
      })
    );

    debug('Going to force cache clearing for all related resources');
    // TODO remove once cache clearing is fixed for requests containing filters
    const relatedModels = [
      'request',
      'intervention',
      'offer',
      'order',
      'deposit-invoice',
      'invoice',
    ];
    yield Promise.all(relatedModels.map((modelName) => this.store.forceCacheClear(modelName)));

    // Remove (dangling) rejected records
    debug('The following (dangling) records will be destroyed');
    yield Promise.all(
      [
        this.findBlock('address').rejectedUnit.value,
        ...this.findBlock('telephones').rejectedValues,
        ...this.findBlock('emails').rejectedValues,
      ]
        .filter((record) => record)
        .map((record) => {
          debug(`- ${record.constructor.name} ${record.id}`);
          return record.destroyRecord();
        })
    );
    yield this.rejectedCustomer.destroyRecord();

    yield this.args.didMerge(this.acceptedCustomer);
  }
}
