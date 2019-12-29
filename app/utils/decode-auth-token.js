export default function decodeAuthToken(jwtToken) {
  const payload = jwtToken.split('.')[1];
  const tokenData = decodeURIComponent(window.escape(atob(payload)));

  try {
    return JSON.parse(tokenData);
  } catch (e) {
    return tokenData;
  }
}
