import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { tagName } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@tagName('')
export default class MissingCertificateDialog extends Component {
  model = null;
  show = false;
  onClose = null;

  @action
  close() {
    this.onClose();
  }
}
