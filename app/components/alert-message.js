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
      return 'close-circle-fill';
    } else if (this.level == 'warning') {
      return 'alert-fill';
    } else if (this.level == 'success') {
      return 'checkbox-circle-fill';
    } else {
      return 'information-fill';
    }
  }
}
