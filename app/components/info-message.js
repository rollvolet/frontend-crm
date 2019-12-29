import classic from 'ember-classic-decorator';
import { classNames, tagName } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@tagName('p')
@classNames('info-message')
export default class InfoMessage extends Component {
  message = null;
}
