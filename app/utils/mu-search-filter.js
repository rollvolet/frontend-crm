import filterFlagToBoolean from './filter-flag-to-boolean';
import onlyNumericChars from './only-numeric-chars';

export default class MuSearchFilter {
  constructor(initialFilter = {}) {
    this.filter = Object.assign({}, initialFilter);
  }

  get value() {
    const copiedFilter = Object.assign({}, this.filter);

    for (let key in copiedFilter) {
      if (copiedFilter[key] == null) {
        delete copiedFilter[key]; // mu-search doesn't work well with unspecified filters
      }
    }

    return copiedFilter;
  }

  hasKey(key) {
    return this.filter[key] != null;
  }

  setFilterFlag(filterKey, flag, trueValue = true, falseValue = false) {
    this.filter[filterKey] = filterFlagToBoolean(flag, trueValue, falseValue);
  }

  setExistanceFlag(property, flag) {
    if (flag == 0) {
      this.noExistance(property);
    } else if (flag == 1) {
      this.ensureExistance(property);
    } // else flag == -1: n/a
  }

  ensureExistance(property) {
    this.filter[`:has:${property}`] = 't';
  }

  noExistance(property) {
    this.filter[`:has-no:${property}`] = 't';
  }

  setWildcardFilter(filterKey, value, ignoreCase = true) {
    if (value) {
      let wildcardValue = value;
      if (!wildcardValue.endsWith('*') && !wildcardValue.endsWith('+')) {
        wildcardValue = `${wildcardValue}*`;
      }

      if (ignoreCase) {
        wildcardValue = wildcardValue.toLowerCase();
      }

      this.filter[`:wildcard:${filterKey}`] = wildcardValue;
    }
  }

  setCaseIdentifierFilter(filterKey, value) {
    if (value) {
      let prefix = ['AD', 'IR', 'F'].find((prefix) => value.startsWith(prefix));
      if (!prefix) {
        prefix = '[A-Z]{1,2}';
      }
      const numberValue = onlyNumericChars(value);
      this.filter[`:regexp:${filterKey}`] = `${prefix}-${numberValue}.*`;
    }
  }
}
