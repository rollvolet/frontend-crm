import snakeToCamelString from '../utils/snake-to-camel-string';

export default class OutstandingJobReport {
  constructor(obj) {
    const keys = Object.keys(obj);
    for (let key of keys) {
      const k = snakeToCamelString(key);
      this[k] = obj[key];
    }
  }
}
