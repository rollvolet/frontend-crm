import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

@classic
export default class MainController extends Controller {
  @service
  configuration;

  @service
  session;

  @action
  openMail() {
    window.location.href = 'mailto:erika.pauwels@redpencil.io';
  }

  @action
  logout() {
    this.session.invalidate();
  }

  @action
  goToProfile() {
    window.alert("User profile not implemented yet");
  }
}
