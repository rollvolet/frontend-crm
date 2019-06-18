import { helper } from '@ember/component/helper';

export function formatInvoiceNumber(value) {
  const valueStr = (value && value.toString()) || '';
  if (valueStr.length > 2)
    return `${valueStr.substring(0,2)}/${valueStr.substring(2)}`;
  else
    return valueStr;
}

export function deformatInvoiceNumber(formattedNumber) {
  const numberStr = (formattedNumber || '').replace('/', '');
  return Number(numberStr);
}

export default helper(formatInvoiceNumber);
