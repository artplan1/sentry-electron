/* eslint-disable no-restricted-globals */
import {
  BrowserOptions,
  defaultIntegrations as defaultBrowserIntegrations,
  init as browserInit,
} from '@sentry/browser';
import { logger } from '@sentry/utils';

import { EventToMain, ScopeToMain } from './integrations';

export const defaultIntegrations = [...defaultBrowserIntegrations, new ScopeToMain(), new EventToMain()];

/**
 * Initialize Sentry in the Electron renderer process
 */
export function init(options: BrowserOptions = {}): void {
  // Ensure the browser SDK is only init'ed once.
  if (window?.__SENTRY__RENDERER_INIT__) {
    logger.warn(`The browser SDK has already been initialized.
If init has been called in the preload and contextIsolation is disabled, is not required to call init in the renderer`);
    return;
  }

  window.__SENTRY__RENDERER_INIT__ = true;

  // We don't want browser session tracking enabled by default because we already have Electron
  // specific session tracking
  if (options.autoSessionTracking === undefined) {
    options.autoSessionTracking = false;
  }

  if (options.defaultIntegrations === undefined) {
    options.defaultIntegrations = defaultIntegrations;
  }

  if (options.dsn === undefined) {
    // Events are sent via the main process but browser SDK wont start without dsn
    options.dsn = 'https://12345@dummy.dsn/12345';
  }

  // We only handle initialScope in the main process otherwise it can cause race conditions over IPC
  delete options.initialScope;

  browserInit(options);
}
