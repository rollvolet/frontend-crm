import { helper } from '@ember/component/helper';

export function formatVatNumber([vatNumber]) {
  if (vatNumber) {
    const prefix = vatNumber.substr(0, 2);
    const number = vatNumber.substr(2);
    vatNumber = `${prefix} ${number.substr(0,4)}.${number.substr(4,3)}.${number.substr(7)}`;
  }

  return vatNumber;
}

export default helper(formatVatNumber);
