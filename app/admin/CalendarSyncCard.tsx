"use client";

import { useState } from "react";

export default function CalendarSyncCard({ icalUrl }: { icalUrl: string }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Google requires the URL with the special "webcal://" or you can use the Google Calendar UI redirect
  const googleUrl = `https://calendar.google.com/calendar/r/settings/addbyurl?url=${encodeURIComponent(icalUrl)}`;

  // For iPhone/iPad: the webcal:// scheme triggers the Calendar app's "subscribe" flow
  const webcalUrl = icalUrl.replace(/^https?:/, "webcal:");

  async function copy() {
    try {
      await navigator.clipboard.writeText(icalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API blocked — fallback handled by select-all */
    }
  }

  return (
    <div className="border border-accent/40 bg-background p-5 md:p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-foreground/50 mb-1">
            Calendar sync
          </p>
          <h3 className="font-seasons text-xl">Live booking feed</h3>
          <p className="text-xs text-foreground/60 mt-1 max-w-md">
            Subscribe once on your phone or laptop calendar. Every confirmed booking
            appears automatically. Updates within an hour.
          </p>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[10px] uppercase tracking-widest text-foreground/60 hover:text-brand"
        >
          {expanded ? "Hide setup" : "Setup →"}
        </button>
      </div>

      {/* Quick CTAs */}
      <div className="flex flex-wrap gap-2 mt-4">
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border border-brand/40 hover:border-brand text-foreground hover:text-brand px-4 py-2 transition"
        >
          <span className="text-base">📆</span> Add to Google
        </a>
        <a
          href={webcalUrl}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border border-brand/40 hover:border-brand text-foreground hover:text-brand px-4 py-2 transition"
        >
          <span className="text-base">📱</span> Add to iPhone / Apple
        </a>
        <button
          onClick={copy}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border border-accent/40 hover:border-brand text-foreground hover:text-brand px-4 py-2 transition"
        >
          <span>{copied ? "✓ Copied" : "📋 Copy URL"}</span>
        </button>
      </div>

      {/* URL preview (selectable) */}
      <p
        className="mt-3 text-[10px] font-mono text-foreground/50 break-all bg-accent/10 p-2 select-all"
        onClick={(e) => {
          // select all on click for easy copy
          const range = document.createRange();
          range.selectNodeContents(e.currentTarget);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }}
      >
        {icalUrl}
      </p>

      {/* Expandable instructions */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-accent/30 space-y-4 text-sm">
          <Setup
            title="📱 iPhone / iPad / Mac"
            steps={[
              'Tap "Add to iPhone / Apple" above (opens Calendar app)',
              'OR: Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar',
              "Paste the URL above (replace https:// with webcal://)",
              'Choose "Server" — done. Refreshes hourly.',
            ]}
          />
          <Setup
            title="🤖 Android (Google Calendar)"
            steps={[
              'Click "Add to Google" above (opens calendar.google.com)',
              "Paste the URL → Add calendar",
              'Open Google Calendar app → Settings → it should appear under "Other calendars"',
              "Toggle on → done.",
            ]}
          />
          <Setup
            title="💻 Outlook / Other"
            steps={[
              "Copy the URL above",
              "In your calendar app, look for 'Add calendar from URL' or 'Subscribe via internet'",
              "Paste and save.",
            ]}
          />
          <p className="text-[11px] text-foreground/50 italic">
            🔒 The URL contains a secret token. Anyone with this URL can see your bookings.
            Keep it private. To rotate: change <code className="font-mono">OWNER_ICS_TOKEN</code> in env vars.
          </p>
        </div>
      )}
    </div>
  );
}

function Setup({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div>
      <p className="font-medium mb-2">{title}</p>
      <ol className="list-decimal list-inside space-y-1 text-xs text-foreground/70 pl-2">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  );
}
