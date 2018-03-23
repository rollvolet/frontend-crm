import { helper } from '@ember/component/helper';

export function formatInvoiceNumber([value]) {
  const valueStr = value.toString() || '';
  return `${valueStr.substring(0,2)}/${valueStr.substring(2)}`;
}

export default helper(formatInvoiceNumber);
