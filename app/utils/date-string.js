import { get, set } from '@ember/object';
import { computed } from '@ember/object';
import moment from 'moment';

export function dateString(dependentKey) {
 return computed(dependentKey, {
    get() {
      if (get(this, dependentKey))
        return moment(get(this, dependentKey)).format('YYYY-MM-DD');
      else
        return null;
    },
    set(key, value) {
      const date = value ? new Date(value) : null;
      set(this, dependentKey, date);
      return value;
    }
 });
}
