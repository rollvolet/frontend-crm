import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class LoginController extends Controller {
  @service session;
}
