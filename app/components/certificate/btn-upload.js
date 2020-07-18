import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

export default class CertificateBtnUploadComponent extends Component {
  get fieldName() {
    return `certificates-${guidFor(this)}`;
  }
}
