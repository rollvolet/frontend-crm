import { helper } from '@ember/component/helper';

export function formatInvoiceNumber(value) {
  const valueStr = (value && value.toString()) || '';
  if (valueStr.length > 4) {
    const i = valueStr.length - 4;
    return `${valueStr.substring(0, i)}/${valueStr.substring(i)}`;
  } else {
    return valueStr;
  }
}

export function deformatInvoiceNumber(formattedNumber) {
  const numberStr = (formattedNumber || '').replace('/', '');
  return Number(numberStr);
}

export default helper(formatInvoiceNumber);
