import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class BuildingsPanel extends Component {
  @service store;

  @service configuration;

  @tracked state = 'list'; // one of 'list', 'detail', 'edit'

  @tracked selectedBuilding = null;

  get displayList() {
    return this.state == 'list';
  }

  get displayDetail() {
    return this.state == 'detail';
  }

  get displayEdit() {
    return this.state == 'edit';
  }

  createNewBuilding() {
    return this.store.createRecord('building', {
      printInFront: true,
      printPrefix: true,
      printSuffix: true,
      language: this.configuration.defaultLanguage(),
      country: this.configuration.defaultCountry(),
      customer: this.args.customer
    });
  }

  @action
  openDetail(building) {
    this.selectedBuilding = building;
    this.state = 'detail';
  }

  @action
  closeDetail() {
    this.state = 'list';
    this.selectedBuilding = null;
  }

  @action
  async openCreate() {
    const building = this.createNewBuilding();
    this.state = 'edit';
    this.selectedBuilding = building;
    try { await building.save(); } catch(e) {} // eslint-disable-line no-empty
  }

  @action
  openEdit(building) {
    this.selectedBuilding = building;
    this.state = 'edit';
  }

  @action
  closeEdit() {
    this.state = 'list';
    this.selectedBuilding = null;
  }
}
