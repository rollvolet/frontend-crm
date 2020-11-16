import { isEmpty } from '@ember/utils';

export default function applyFilterParams(filter) {
  for (let key of Object.keys(filter)) {
    let value = undefined;
    if (Number.isInteger(filter[key]))
      value = filter[key];
    else
      value = filter[key] && !isEmpty(filter[key]) ? filter[key] : undefined;
    this.set(key, value);
  }
  this.set('page', 0); // reset page to 0 on new search
}
