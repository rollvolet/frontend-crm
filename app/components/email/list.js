import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class EmailListComponent extends Component {
  @tracked isCollapsed;
  nbOfCollapsedItems = 3;

  constructor() {
    super(...arguments);
    this.isCollapsed = !!this.args.collapsible;
  }

  get visibleNbOfItems() {
    return this.isCollapsed ? this.nbOfCollapsedItems : this.args.model?.length;
  }

  get isCollapsible() {
    return this.args.collapsible && this.args.model?.length > this.nbOfCollapsedItems;
  }

  @action
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
}
