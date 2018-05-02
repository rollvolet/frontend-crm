import Service, { inject } from '@ember/service';
import { warn } from '@ember/debug';

const onlyNumberRegex = /^[0-9]*$/;

export default Service.extend({
  paperToaster: inject(),
  all(values, callback) {
    return values.reduce( (acc, value) => acc && callback(value), true);
  },
  required(value, label, display = true) {
    if (!value) {
      warn(`${label} is required`, { id: 'validation.required-attribute' });
      if (display)
        this.paperToaster.show(`${label} is verplicht`);
      return false;
    }
    return true;
  },
  onlyNumbers(value, label, display = true) {
    if (value && !onlyNumberRegex.test(value)) {
      warn(`${label} may only contain numbers`, { id: 'validation.only-numbers' });
      if (display)
        this.paperToaster.show(`${label} mag enkel cijfers bevatten`);
      return false;
    }
    return true;
  }
});
