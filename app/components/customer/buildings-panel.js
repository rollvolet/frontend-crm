import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { warn } from '@ember/debug';

export default class BuildingsPanel extends Component {
  @service store;
  @service codelist;
  @service sequence;

  @tracked selectedBuilding = null;
  @tracked isNewBuilding = false;

  async createNewBuilding() {
    const address = this.store.createRecord('address', {
      country: this.codelist.defaultCountry,
    });
    const [position] = await Promise.all([
      this.sequence.fetchNextBuildingPosition(this.args.customer),
      address.save(),
    ]);
    const building = this.store.createRecord('building', {
      position,
      printInFront: true,
      printPrefix: true,
      printSuffix: true,
      language: this.codelist.defaultLanguage,
      address,
      customer: this.args.customer,
    });

    return building.save();
  }

  @task
  *deleteBuilding() {
    try {
      const [address, telephones, emails] = yield Promise.all([
        this.selectedBuilding.address,
        this.selectedBuilding.telephones,
        this.selectedBuilding.emails,
      ]);

      const records = [address, ...telephones.toArray(), ...emails.toArray()];
      yield Promise.all(records.map((t) => t.destroyRecord()));
      yield this.selectedBuilding.destroyRecord();
      this.closeDetail();
    } catch (e) {
      warn(`Something went wrong while destroying building ${this.selectedBuilding.id}`, {
        id: 'destroy-failure',
      });
    }
  }

  @action
  openDetail(building) {
    this.selectedBuilding = building;
  }

  @action
  closeDetail() {
    this.selectedBuilding = null;
    this.isNewBuilding = false;
  }

  @action
  async openCreate() {
    try {
      const building = await this.createNewBuilding();
      this.selectedBuilding = building;
      this.isNewBuilding = true;
    } catch (e) {} // eslint-disable-line no-empty
  }
}
