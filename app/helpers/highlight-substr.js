import { htmlSafe } from '@ember/string';
import { helper } from '@ember/component/helper';

export function highlightSubstr([text, termToHighlight]/*, hash*/) {
  return htmlSafe(text.replace(new RegExp(termToHighlight, 'i'), '<b>$&</b>'));
}

export default helper(highlightSubstr);
