import classic from 'ember-classic-decorator';
import { tagName } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@tagName('')
export default class UiHooks extends Component {
  didInsertHook() {}
  willDestroyHook() {}

  didInsertElement() {
    super.didInsertElement(...arguments);

    this.didInsertHook();
  }

  willDestroyElement() {
    super.willDestroyElement(...arguments);

    this.willDestroyHook();
  }
}
