import Component from '@glimmer/component';
import { action } from '@ember/object';
import { exec } from 'pell';

const defaultOptions = {
  classes: {
    actionbar: 'pell-actionbar p-1 bg-transparent',
    selected: 'bg-gray-100',
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
    options.classes.content = `pell-content ${this.args.textAreaHeight || 'h-full'}`;
    return options;
  }

  @action
  updateValue(html) {
    let cleanedHtml = html;
    if (!this.args.keepInlineStyle) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      doc.querySelectorAll('[style]').forEach((el) => el.removeAttribute('style'));
      cleanedHtml = doc.getElementsByTagName('body')[0].innerHTML;
    }
    this.args.onChange(cleanedHtml);
  }
}
