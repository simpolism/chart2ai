declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    posthog: any;
  }
}

// PostHog event tracking helper
export const trackEvent = (
  eventName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture(eventName, parameters);
  }
};
