import { helper } from '@ember/component/helper';
import { formatPhone } from './format-phone';

export function formatPhoneNumber([number]) {
  return formatPhone([null, number]);
}

export default helper(formatPhoneNumber);
