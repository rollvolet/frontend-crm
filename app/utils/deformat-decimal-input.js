export default function deformatDecimalInput(value) {
  return value ? parseFloat(value.replace(/\s/g, '').replace(/,/g, '.')) : value;
}
