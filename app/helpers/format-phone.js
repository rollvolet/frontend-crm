import { helper } from '@ember/component/helper';

const groupPer3Chars = /(?=(?:...)*$)/;

export function formatPhone([prefix, number]) {
  if (prefix && prefix.startsWith('00')) {
    prefix = prefix.replace('00', '+'); // replaces only the 1st occurence
  }

  if (number) {
    let formattedNumber = number.split(groupPer3Chars).join(' ');
    if (formattedNumber.startsWith('0')) {
      formattedNumber = `(${formattedNumber.slice(0, 1)})${formattedNumber.slice(1)}`;
    }
    return `${prefix} ${formattedNumber}`;
  } else {
    return `${prefix}`;
  }
}

export default helper(formatPhone);
