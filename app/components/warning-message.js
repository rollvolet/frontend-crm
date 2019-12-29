import classic from 'ember-classic-decorator';
import { classNames, tagName } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@tagName('p')
@classNames('warning-message')
export default class WarningMessage extends Component {
  message = null;
}
