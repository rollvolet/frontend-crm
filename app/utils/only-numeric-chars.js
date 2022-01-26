export default function onlyNumericChars(text) {
  return text && text.replace(/\D/g, ''); // \D = any non-digit character
}
