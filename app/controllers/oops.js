import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

@classic
export default class OopsController extends Controller {
  @service
  appState;

  @action
  goBack() {
    const url = this.appState.lastSuccessUrl;

    if (url) {
      window.location = url;
    } else {
      window.location = '/';
    }
  }
}
