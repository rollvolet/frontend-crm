import { helper } from '@ember/component/helper';

const groupPer3Chars = /(?=(?:...)*$)/;

export function formatCaseNumber([number]) {
  if (number) {
    // number may be a string or number
    if (`${number}`.startsWith('AD-')) {
      return `AD ${number.substr('AD-'.length).split(groupPer3Chars).join('.')}`;
    } else if (`${number}`.startsWith('IR-')) {
      return `IR ${number.substr('IR-'.length).split(groupPer3Chars).join('.')}`;
    } else {
      // isolated invoice
      return null;
    }
  } else {
    return number;
  }
}

export default helper(formatCaseNumber);
