import Component from '@glimmer/component';

export default class InterventionDetailViewComponent extends Component {
  get technicianNames() {
    return this.args.model.technicians
      .sortBy('firstName')
      .mapBy('firstName');
  }
}
