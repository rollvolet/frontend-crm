import { helper } from '@ember/component/helper';
import { formatInvoiceNumber } from './format-invoice-number';

const groupPer3Chars = /(?=(?:...)*$)/;

export function formatCaseNumber([number], { showPrefix = true }) {
  if (number) {
    // number may be a string or number
    if (`${number}`.startsWith('AD-')) {
      const formattedNumber = number.substr('AD-'.length).split(groupPer3Chars).join('.');
      return showPrefix ? `AD ${formattedNumber}` : formattedNumber;
    } else if (`${number}`.startsWith('IR-')) {
      const formattedNumber = number.substr('IR-'.length).split(groupPer3Chars).join('.');
      return showPrefix ? `IR ${formattedNumber}` : formattedNumber;
    } else {
      // isolated invoice
      const formattedNumber = formatInvoiceNumber(number.substr('F-'.length));
      return showPrefix ? `F ${formattedNumber}` : formattedNumber;
    }
  } else {
    return number;
  }
}

export default helper(formatCaseNumber);
