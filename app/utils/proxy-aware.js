import { get, set, computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';

export function proxyAware(dependentKey) {
  return computed(dependentKey, `${dependentKey}.content`, function() {
    if (get(this, dependentKey) instanceof ObjectProxy)
      return get(this, `${dependentKey}.content`);
    else
      return get(this, dependentKey);
 });
}
