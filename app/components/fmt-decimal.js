import classic from 'ember-classic-decorator';
import { tagName } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@tagName('')
class FmtDecimalComponent extends Component {}

FmtDecimalComponent.reopenClass({
  positionalParams: ['value']
});

export default FmtDecimalComponent;
