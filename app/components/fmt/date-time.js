import Component from '@glimmer/component';

export default class FmtDateTimeComponent extends Component {
  get format() {
    return this.args.format || 'dd-MM-yyyy HH:mm:ss';
  }
}
