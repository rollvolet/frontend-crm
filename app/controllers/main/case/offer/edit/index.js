import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class MainCaseOfferEditIndexController extends Controller {
  queryParams = ['editMode'];

  @tracked editMode = false;
}
