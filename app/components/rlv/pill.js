import Component from '@glimmer/component';

export default class RkbPillComponent extends Component {
  get fillColor() {
    if (this.args.color == 'red') {
      return 'fill-red-500';
    } else if (this.args.color == 'blue') {
      return 'fill-blue-500';
    } else if (this.args.color == 'green') {
      return 'fill-green-500';
    } else {
      return 'fill-gray-500';
    }
  }

  get textColor() {
    if (this.args.color == 'red') {
      return 'text-red-700';
    } else if (this.args.color == 'blue') {
      return 'text-blue-700';
    } else if (this.args.color == 'green') {
      return 'text-green-700';
    } else {
      return 'text-gray-700';
    }
  }

  get bgColor() {
    if (this.args.color == 'red') {
      return 'bg-red-100';
    } else if (this.args.color == 'blue') {
      return 'bg-blue-100';
    } else if (this.args.color == 'green') {
      return 'bg-green-100';
    } else {
      return 'bg-gray-100';
    }
  }

  get focusRingColor() {
    if (this.args.color == 'red') {
      return 'focus:ring-red-200';
    } else if (this.args.color == 'blue') {
      return 'focus:ring-blue-200';
    } else if (this.args.color == 'green') {
      return 'focus:ring-green-200';
    } else {
      return 'focus:ring-gray-200';
    }
  }
}
