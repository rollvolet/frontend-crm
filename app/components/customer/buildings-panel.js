import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { equal } from '@ember/object/computed';
import Component from '@ember/component';

@classic
export default class BuildingsPanel extends Component {
  @service
  store;

  @service
  configuration;

  customer = null;
  state = 'list'; // one of 'list', 'detail', 'edit'

  @equal('state', 'list')
  displayList;

  @equal('state', 'detail')
  displayDetail;

  @equal('state', 'edit')
  displayEdit;

  createNewBuilding() {
    return this.store.createRecord('building', {
      printInFront: true,
      printPrefix: true,
      printSuffix: true,
      language: this.configuration.defaultLanguage(),
      country: this.configuration.defaultCountry(),
      customer: this.customer
    });
  }

  @action
  openDetail(building) {
    this.set('selectedBuilding', building);
    this.set('state', 'detail');
  }

  @action
  closeDetail() {
    this.set('state', 'list');
    this.set('selectedBuilding', null);
  }

  @action
  async openCreate() {
    const building = this.createNewBuilding();
    this.set('state', 'edit');
    this.set('selectedBuilding', building);
    try { await building.save(); } catch(e) {} // eslint-disable-line no-empty
  }

  @action
  openEdit(building) {
    this.set('selectedBuilding', building);
    this.set('state', 'edit');
  }

  @action
  closeEdit() {
    this.set('state', 'list');
    this.set('selectedBuilding', null);
  }
}
