import { helper } from '@ember/component/helper';
import titleizeExtended from '../utils/titleize-extended';

export function titleizeExtendedHelper([string]) {
  return titleizeExtended(string);
}

export default helper(titleizeExtendedHelper);
