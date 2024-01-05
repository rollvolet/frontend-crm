import { helper } from '@ember/component/helper';
import formatFn from 'date-fns/format';
import parseISO from 'date-fns/parseISO';

export function formatDate([date, format, options]) {
  if (date) {
    if (typeof date == 'string') {
      return formatFn(parseISO(date), format, options);
    } else {
      return formatFn(date, format, options);
    }
  } else {
    return null;
  }
}

export default helper(formatDate);
