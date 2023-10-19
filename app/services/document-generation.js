import Service from '@ember/service';

export default class DocumentGenerationService extends Service {
  // Document downloads

  downloadVisitSummary(requestIds) {
    const queryParams = requestIds.map((id) => `ids=${id}`).join('&');
    this._openInNewTab(`/api/files/visit-summary?${queryParams}`);
  }

  // Core helpers
  _openInNewTab(href) {
    Object.assign(document.createElement('a'), {
      target: '_blank',
      href,
    }).click();
  }
}
