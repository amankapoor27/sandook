"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import {
  trackAnalyticsEvent,
  type ClientAnalyticsEvent,
} from "@/lib/track-analytics";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  analyticsEvent: ClientAnalyticsEvent;
  analyticsSlug?: string;
};

export function TrackedLink({
  analyticsEvent,
  analyticsSlug,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackAnalyticsEvent(analyticsEvent, analyticsSlug);
        onClick?.(event);
      }}
    />
  );
}
