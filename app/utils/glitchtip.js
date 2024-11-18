import { init as initGlitchtip, captureException } from '@sentry/ember';
import config from '../config/environment';

export default function setupGlitchtip() {
  try {
    if (config.sentry.dsn !== '{{SENTRY_DSN}}') {
      const sentryEnvironment =
        config.sentry.environment !== '{{SENTRY_ENVIRONMENT}}'
          ? config.sentry.environment
          : 'production';
      initGlitchtip({
        dsn: config.sentry.dsn,
        release: config.APP.version, // ember-cli-app-version sets this value
        environment: sentryEnvironment,
        autoSessionTracking: false, // Not implemented by GlitchTip so it triggers a lot of 501 "Not implemented" responses
      });
    }
  } catch (e) {
    console.warn(`Could not init glitchtip ${e}`);
  }
}

export function reportError(error, extra) {
  if (error instanceof Error) {
    captureException(error, { extra });
  } else {
    captureException(new Error(extra?.label || JSON.stringify(error)), { extra });
  }
}
