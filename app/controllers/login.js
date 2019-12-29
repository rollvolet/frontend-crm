import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject } from '@ember/service';
import Controller from '@ember/controller';
import { task } from 'ember-concurrency';

@classic
export default class LoginController extends Controller {
  @inject()
  session;

  @(task(function * () {
    yield this.session.authenticate('authenticator:torii', 'azure-ad2-oauth2').catch((reason) => {
      this.set('errorMessage', reason.error || reason);
    });
  }).restartable())
  login;

  @action
  logout() {
    this.session.invalidate();
  }

  @action
  resetError() {
    this.set('errorMessage', null);
  }
}
