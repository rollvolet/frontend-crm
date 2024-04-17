import { helper } from '@ember/component/helper';
import formatFn from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { nlBE } from 'date-fns/locale';

export function formatDate([date, format, customOptions = {}]) {
  const options = Object.assign({ locale: nlBE }, customOptions);
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
