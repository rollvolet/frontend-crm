import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@classNames('resource-details')
export default class CustomerDetailCard extends Component {
  memoExpanded = false;

  get joinedTagNamesPromise() {
    return ( async () => {
      const tags = await this.model.tags;
      return tags.map(t => t.name).join(', ');
    })();
  }
}
