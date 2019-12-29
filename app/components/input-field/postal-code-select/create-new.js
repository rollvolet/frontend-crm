import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { tagName } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@tagName('')
export default class CreateNew extends Component {
  @action
  create() {
    this.onCreate();
    this.select.actions.close();
  }
}
