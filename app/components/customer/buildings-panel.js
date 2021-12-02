import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class BuildingsPanel extends Component {
  @service store;
  @service configuration;

  @tracked selectedBuilding = null;

  createNewBuilding() {
    return this.store.createRecord('building', {
      printInFront: true,
      printPrefix: true,
      printSuffix: true,
      language: this.configuration.defaultLanguage,
      country: this.configuration.defaultCountry,
      customer: this.args.customer,
    });
  }

  @action
  openDetail(building) {
    this.selectedBuilding = building;
  }

  @action
  closeDetail() {
    this.selectedBuilding = null;
  }

  @action
  async openCreate() {
    const building = this.createNewBuilding();
    this.selectedBuilding = building;
    try {
      await building.save();
    } catch (e) {} // eslint-disable-line no-empty
  }
}
