import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { warn } from '@ember/debug';

export default class LoginMsalComponent extends Component {
  @service session;

  @tracked errorMessage;
  @tracked isAuthenticating = false;

  @action
  async login(event) {
    event.preventDefault(); // prevent default submit behaviour

    this.isAuthenticating = false;
    this.errorMessage = null;

    try {
      this.isAuthenticating = true;
      await this.session.authenticate('authenticator:torii', 'azure-ad2-oauth2');
    } catch (e) {
      warn(JSON.stringify(e), { id: 'authentication.failure' });
      if (e.errors && e.errors.length && e.errors[0].title) {
        this.errorMessage = e.errors[0].title;
      } else if (e.status == 403) {
        this.errorMessage = 'U hebt geen toegang tot de applicatie';
      } else {
        this.errorMessage = 'Er is iets misgelopen. Probeer opnieuw.';
      }
    } finally {
      this.isAuthenticating = false;
    }
  }
}
