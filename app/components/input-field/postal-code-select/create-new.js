import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class CreateNew extends Component {
  @action
  create() {
    this.args.onCreate();
    this.args.select.actions.close();
  }
}
