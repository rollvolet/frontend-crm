import Service, { inject } from '@ember/service';
import { warn } from '@ember/debug';

export default Service.extend({
  paperToaster: inject(),
  required(value, label, display = true) {
    if (!value) {
      warn(`${label} is required`, { id: 'validation.required-attribute' });
      if (display)
        this.paperToaster.show(`${label} is verplicht`);
      return false;
    }
    return true;
  }
});
