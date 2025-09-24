// simple console analytics stub you can later swap for PostHog/GA
export const analytics = {
  track(event: string, payload?: Record<string, any>) {
    // eslint-disable-next-line no-console
    console.log('[analytics]', event, payload || {})
  }
}
