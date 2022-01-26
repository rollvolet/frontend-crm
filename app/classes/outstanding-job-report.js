import kebabToCamelString from '../utils/kebab-to-camel-string';

export default class OutstandingJobReport {
  constructor(obj) {
    const keys = Object.keys(obj);
    for (let key of keys) {
      const k = kebabToCamelString(key);
      this[k] = obj[key];
    }
  }
}
