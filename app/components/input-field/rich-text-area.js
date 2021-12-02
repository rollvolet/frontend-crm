import Component from '@glimmer/component';
import { exec } from 'pell';

const defaultOptions = {
  classes: {
    actionbar: 'pell-actionbar mt-1',
  },
  actions: [
    'bold',
    'underline',
    'italic',
    'strikethrough',
    'olist',
    'ulist',
    {
      name: 'subscript',
      icon: 'x<sub>2</sub>',
      title: 'Subscript',
      result: () => exec('subscript'),
    },
    {
      name: 'superscript',
      icon: 'x<sup>2</sup>',
      title: 'Superscript',
      result: () => exec('superscript'),
    },
  ],
};

export default class InputFieldRichTextAreaComponent extends Component {
  get options() {
    const customOptions = this.args.options || {};
    const options = Object.assign({}, defaultOptions, customOptions);
    options.classes.content = `pell-content ${this.args.textAreaHeight || 'h-48'}`;
    return options;
  }
}
