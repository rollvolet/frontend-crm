import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class IndexController extends Controller {
  @service userInfo;

  get greeting() {
    const hours = new Date().getHours();
    if (hours >= 4 && hours < 11) {
      return 'goedemorgen';
    } else if (hours >= 11 && hours < 14) {
      return 'goedemiddag';
    } else if (hours >= 14 && hours < 17) {
      return 'goedenamiddag';
    } else if (hours >= 17 && hours < 23) {
      return 'goedeavond';
    } else {
      return 'goedenacht';
    }
  }
}
