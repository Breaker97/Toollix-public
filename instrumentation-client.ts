import posthog from 'posthog-js';

// Initialize PostHog only if token exists
const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
if (posthogToken) {
    posthog.init(posthogToken, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    });
}
