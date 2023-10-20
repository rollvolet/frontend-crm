import Component from '@glimmer/component';

export default class AlertMessageComponent extends Component {
  get level() {
    return this.args.level || 'info';
  }

  get color() {
    if (this.level == 'error') {
      return 'red';
    } else if (this.level == 'warning') {
      return 'yellow';
    } else if (this.level == 'success') {
      return 'green';
    } else {
      return 'blue';
    }
  }

  get icon() {
    if (this.level == 'error') {
      return 'heroicons-sm-x-circle';
    } else if (this.level == 'warning') {
      return 'heroicons-sm-exclamation';
    } else if (this.level == 'success') {
      return 'heroicons-sm-check-circle';
    } else {
      return 'heroicons-sm-information-circle';
    }
  }
}
