import classic from 'ember-classic-decorator';
import { tagName } from '@ember-decorators/component';
import { computed } from '@ember/object';
import Component from '@ember/component';

@classic
@tagName('')
export default class FmtEmail extends Component {
  value = null;

  @computed('value')
  get href() {
    return `mailto:${this.value}`;
  }
}
