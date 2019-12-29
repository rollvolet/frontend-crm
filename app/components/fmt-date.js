import classic from 'ember-classic-decorator';
import { tagName } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@tagName('')
class FmtDateComponent extends Component {
  emptyValue = '-';
}

FmtDateComponent.reopenClass({
  positionalParams: ['value']
});

export default FmtDateComponent;
