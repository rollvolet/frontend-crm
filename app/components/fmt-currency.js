import classic from 'ember-classic-decorator';
import { tagName } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@tagName('')
class FmtCurrencyComponent extends Component {}

FmtCurrencyComponent.reopenClass({
  positionalParams: ['value']
});

export default FmtCurrencyComponent;
