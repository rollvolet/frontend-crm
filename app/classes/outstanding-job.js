import snakeToCamelString from '../utils/snake-to-camel-string';
import { tracked } from '@glimmer/tracking';

export default class OutstandingJob {
  @tracked expandComment

  constructor(obj) {
    const keys = Object.keys(obj);
    for (let key of keys) {
      const k = snakeToCamelString(key);
      this[k] = obj[key];
    }
  }

  get techniciansList() {
    if (this.technicians)
      return this.technicians.split(',').map(t => t.trim());
    else
      return [];
  }
}
