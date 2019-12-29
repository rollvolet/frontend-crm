import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Component from '@ember/component';

@classic
export default class BuildingDetailPanel extends Component {
  model = null;
  onClose = null;
  onEdit = null;

  @action
  toggleEdit() {
    this.onEdit(this.model);
  }
}
