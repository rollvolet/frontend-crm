import BaseMuAuthenticator from 'ember-mu-login/authenticators/mu-semtech';
import classic from 'ember-classic-decorator';

@classic
export default class MuSemtechAuthenticator extends BaseMuAuthenticator {
  constructor() {
    super(...arguments);
    this.basePath = '/mock-sessions';
  }
}
