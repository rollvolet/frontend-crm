import classic from 'ember-classic-decorator';
import { classNames, tagName } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@tagName('span')
@classNames('save-status')
export default class SaveStatusIcon extends Component {
  task = null;
  model = null;
}
