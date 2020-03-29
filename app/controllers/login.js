import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency-decorators';

export default class LoginController extends Controller {
  @service session

  @tracked errorMessage

  @restartableTask
  *login() {
    yield this.session.authenticate('authenticator:torii', 'azure-ad2-oauth2').catch((reason) => {
      this.errorMessage = reason.error || reason;
    });
  }

  @action
  logout() {
    this.session.invalidate();
  }

  @action
  resetError() {
    this.errorMessage = null;
  }
}
