export default function getGoogleAnalyticsClientId() {
  let id;
  if (window.ga) {
    window.ga(function() {
      id = window.ga?.getAll()[0].get('clientId');
    });
  }
  return id;
}
