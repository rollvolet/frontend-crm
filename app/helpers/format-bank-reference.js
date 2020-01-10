import { helper } from '@ember/component/helper';

export function formatBankReference([value]) {
  if (value.length >= 12) {
    return `+++${value.substring(0, 3)}/${value.substring(3, 7)}/${value.substring(7)}+++`;
  } else {
    return value;
  }
}

export default helper(formatBankReference);
