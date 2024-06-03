import { isPresent } from '@ember/utils';

export default function formatCustomerName(customer, opts) {
  const options = Object.assign({ printAll: false }, opts);

  const parts = [];
  if (customer.printInFront) {
    parts.push(customer.honorificPrefix);
  }
  if (customer.printPrefix || options.printAll) {
    parts.push(customer.prefix);
  }
  parts.push(customer.name);
  if (customer.printSuffix || options.printAll) {
    parts.push(customer.suffix);
  }
  if (!customer.printInFront) {
    parts.push(customer.honorificPrefix);
  }

  return parts.filter((e) => isPresent(e?.trim())).join(' ');
}
