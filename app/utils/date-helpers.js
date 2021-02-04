export function unlocalize(localizedDate) {
  if (localizedDate)
    return new Date(Date.UTC(localizedDate.getFullYear(), localizedDate.getMonth(), localizedDate.getDate()));
  else
    return null;
}
