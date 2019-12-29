import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { tagName } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@tagName('')
export default class UnsavedChangesDialog extends Component {
  show = false;
  onConfirm = null;

  @action
  cancelClose() {
    this.set('show', false);
  }

  @action
  confirmClose() {
    this.set('show', false);
    this.onConfirm();
  }
}
