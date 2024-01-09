import BaseMuAuthenticator from 'ember-mu-login/authenticators/mu-semtech';

export default class MuSemtechAuthenticator extends BaseMuAuthenticator {
  constructor() {
    super(...arguments);
    this.basePath = '/mock-sessions';
  }
}
