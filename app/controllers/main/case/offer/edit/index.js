import Controller from '@ember/controller';

export default class IndexController extends Controller {
  queryParams = ['editMode'];
  editMode = false;
}
