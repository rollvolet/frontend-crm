export default function kebabToCamelString(text) {
  return text && text.replace(/(-\w)/g, (entry) => entry[1].toUpperCase());
}
