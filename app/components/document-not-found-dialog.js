import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Component from '@ember/component';

@classic
export default class DocumentNotFoundDialog extends Component {
  show = false;

  @action
  close() {
    this.set('show', false);
  }
}
