"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

// Pageviews only. Query strings and fragments are dropped so nothing a visitor
// typed into a URL ever reaches the analytics dashboard.
function stripQuery(event: BeforeSendEvent): BeforeSendEvent {
    const url = new URL(event.url);
    url.search = "";
    url.hash = "";
    return { ...event, url: url.toString() };
}

export default function SiteAnalytics() {
    return <Analytics beforeSend={stripQuery} />;
}
