import Service, { inject } from '@ember/service';
import { warn } from '@ember/debug';

const onlyNumberRegex = /^\d*$/;
const vatNumberRegex = /^[a-zA-Z]{2}\d{10,18}$/;

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
  },
  length(value, label, min, max, display = true) {
    const isValid = value && value.length >= min && value.length <= max;
    if (!isValid) {
      warn(`${label} must contain [${min}-${max}] characters`, { id: 'validation.length' });
      if (display)
        this.paperToaster.show(`${label} moet tussen ${min} en ${max} karakters bevatten`);
    }
    return isValid;
  },
  minLength(value, label, min, display = true) {
    const isValid = value && value.length >= min;
    if (!isValid) {
      warn(`${label} must contain at least ${min} characters`, { id: 'validation.length' });
      if (display)
        this.paperToaster.show(`${label} moet minstens ${min} karakters bevatten`);
    }
    return isValid;
  },
  maxLength(value, label, max, display = true) {
    const isValid = value && value.length <= max;
    if (!isValid) {
      warn(`${label} may contain maximum ${max} characters`, { id: 'validation.length' });
      if (display)
        this.paperToaster.show(`${label} mag maximaal ${max} karakters bevatten`);
    }
    return isValid;
  },
  vatNumber(value, label, display = true) {
    if (value && !vatNumberRegex.test(value)) {
      warn(`Invalid ${label}`, { id: 'validation.vat-number' });
      if (display)
        this.paperToaster.show(`Ongeldig ${label}`);
      return false;
    }
    return true;
  }
});
