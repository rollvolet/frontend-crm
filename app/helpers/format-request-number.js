import { helper } from '@ember/component/helper';

const groupPer3Chars = /(?=(?:...)*$)/;

export function formatRequestNumber([number]) {
  if (number) {
    // number may be a string or number
    return `${number}`.split(groupPer3Chars).join('.');
  } else {
    return number;
  }
}

export default helper(formatRequestNumber);
