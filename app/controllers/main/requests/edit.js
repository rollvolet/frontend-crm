import classic from 'ember-classic-decorator';
import Controller from '@ember/controller';

@classic
export default class EditController extends Controller {
  queryParams = ['editMode'];
  editMode = false;
}
