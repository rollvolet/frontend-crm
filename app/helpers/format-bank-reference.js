import { helper } from '@ember/component/helper';

export function formatBankReference([value]) {
  if (value.length >= 12) {
    return `+++${value.substring(0, 3)}/${value.substring(3, 8)}/${value.substring(8)}+++`;
  } else {
    return value;
  }
}

export default helper(formatBankReference);
