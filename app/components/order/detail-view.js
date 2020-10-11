import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class OrderDetailViewComponent extends Component {
  @service case

  get request() {
    return this.case.current && this.case.current.request;
  }

  get technicianNames() {
    return this.args.model.technicians
      .sortBy('firstName')
      .mapBy('firstName');
  }

  get isNbOfPersonsWarning() {
    return this.args.model.scheduledNbOfPersons != 2;
  }
}
