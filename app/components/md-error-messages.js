import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@classNames('md-input-messages-animation', 'md-auto-hide')
export default class MdErrorMessages extends Component {
  errors = null;
}
