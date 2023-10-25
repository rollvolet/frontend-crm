import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class FilterPanelComponent extends Component {
  @tracked isCollapsed = true;
}
