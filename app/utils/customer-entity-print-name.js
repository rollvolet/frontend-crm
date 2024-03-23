export default function printName(customer) {
  let printName = '';
  if (customer.printPrefix && customer.prefix) {
    printName += customer.prefix + ' ';
  }
  printName += customer.name || '';
  if (customer.printSuffix && customer.suffix) {
    printName += ' ' + customer.suffix;
  }

  return printName.trim();
}
