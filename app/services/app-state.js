import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import report from '../utils/report-error';

export default class AppStateService extends Service {
  @service router;

  @tracked lastError = null;
  @tracked lastSuccessUrl = null;

  reportError(error) {
    this.lastError = error;
    this.lastSuccessUrl = this.router.currentURL;

    report(error, this.lastSuccessUrl);
  }
}
