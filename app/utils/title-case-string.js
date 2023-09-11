export default function titleCaseString(text) {
  return text?.toLowerCase().replace(/(^|\s|-|\()\w/g, (firstLetter) => firstLetter.toUpperCase());
}
