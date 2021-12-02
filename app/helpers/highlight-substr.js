import { htmlSafe } from '@ember/string';
import { helper } from '@ember/component/helper';

export function highlightSubstr([text, termToHighlight] /*, hash*/) {
  if (text) {
    return htmlSafe(text.replace(new RegExp(termToHighlight, 'i'), '<b>$&</b>'));
  } else {
    return text;
  }
}

export default helper(highlightSubstr);
