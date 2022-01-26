export default function snakeToCamelString(text) {
  return text && text.replace(/(_\w)/g, (entry) => entry[1].toUpperCase());
}
