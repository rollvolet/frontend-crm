export default class MonthlySalesEntry {
  constructor(obj) {
    const keys = Object.keys(obj);
    for (let key of keys) {
      this[key] = obj[key];
    }
  }
}
