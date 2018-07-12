import { helper } from '@ember/component/helper';

export function formatVatNumber([vatNumber]) {
  if (vatNumber) {
    const country = vatNumber.substr(0, 2);
    const number = vatNumber.substr(2);
    if (country.toUpperCase() == 'BE') {
      if (number.length == 9)
        return `${country} 0${number.substr(0,3)}.${number.substr(3,3)}.${number.substr(6)}`;
      else if (number.length > 9)
        return `${country} ${number.substr(0,4)}.${number.substr(4,3)}.${number.substr(7)}`;
    }
    return `${country} ${number}`;
  }
  return vatNumber;
}

export default helper(formatVatNumber);
