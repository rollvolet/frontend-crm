export default function sum(value) {
  if (value)
    return value.reduce((a, b) => a + b, 0);
  else
    return 0;
}
