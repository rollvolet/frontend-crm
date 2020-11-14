export default function snakeToCamelString(text) {
  return text && text.replace(/(-\w)/g, (entry) => entry[1].toUpperCase());
}
