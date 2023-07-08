import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';

export default class InputFieldAddressInputComponent extends Component {
  @tracked value;

  constructor() {
    super(...arguments);
    this.value = this.args.value;
  }

  get elementId() {
    return `address-input-${guidFor(this)}`;
  }

  get rows() {
    return this.args.rows || 3;
  }

  @action
  setValue(event) {
    this.value = event.target.value;
  }

  @action
  formatAddressLines() {
    const lines = (this.value || '')
      .replace(/[\s\uFEFF\xA0]+$/g, '') // remove trailing newlines
      .split('\n');

    const formattedLines = lines.map((line) => {
      if (line && line.length) {
        return line.charAt(0).toUpperCase() + line.slice(1); // upcase first letter
      } else {
        return undefined;
      }
    });

    this.value = formattedLines.join('\n');
    this.args.onChange(this.value);
  }
}
