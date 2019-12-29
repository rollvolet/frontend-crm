import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { debug } from '@ember/debug';

@classic
@classNames('data-preloader')
export default class DataPreloader extends Component {
  @service
  configuration;

  didInsertElement() {
    debug('Preloading static lists');
    this.configuration.preloadStaticLists.perform();
  }
}
