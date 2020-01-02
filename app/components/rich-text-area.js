import Component from '@glimmer/component';
import { exec } from 'pell';

const defaultOptions = {
  actions: [
    'bold', 'underline', 'italic', 'strikethrough', 'olist', 'ulist',
    {
      name: 'subscript',
      icon: 'x<sub>2</sub>',
      title: 'Subscript',
      result: () => exec('subscript')
    },
    {
      name: 'superscript',
      icon: 'x<sup>2</sup>',
      title: 'Superscript',
      result: () => exec('superscript')
    }
  ]
};

export default class RichTextAreaComponent extends Component {
  get options() {
    const customOptions = this.args.options || {};
    return Object.assign({}, defaultOptions, customOptions);
  }

  get clazz() {
    const classes = this.args.class || '';
    return 'pell-editor ' + classes;
  }
}
