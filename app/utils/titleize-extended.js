import titleize from 'ember-cli-string-helpers/utils/titleize';

// In addition to 'titleize' this also upcases characters before a '.' and after a '('
export default function titleizeExtended(string = '') {
  const s = titleize(string);
  return s.replace(/\((.)?|\.(.)?/g, function(m) {
    return m.toUpperCase();
  });
}
