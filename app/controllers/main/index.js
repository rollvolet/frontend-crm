import classic from 'ember-classic-decorator';
import { inject } from '@ember/service';
import Controller from '@ember/controller';

@classic
export default class IndexController extends Controller {
  @inject()
  session;
}
