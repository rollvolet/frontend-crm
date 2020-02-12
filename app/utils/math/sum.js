export default function sum(value) {
  if (value)
    return value.reduce((a, b) => (a || 0) + (b || 0), 0);
  else
    return 0;
}
