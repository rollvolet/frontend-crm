import { helper } from '@ember/component/helper';

export function formatVatRate([vatRate]) {
  if (vatRate) {
    if (vatRate.code == 'm') {
      return vatRate.name; // 'BTW verlegd'
    } else {
      return `${vatRate.name} BTW`;
    }
  } else {
    return null;
  }
}

export default helper(formatVatRate);
