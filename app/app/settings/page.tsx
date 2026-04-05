"use client";

import { useState } from "react";
import { MailCheck } from "lucide-react";

import { PageShell } from "@/components/app/page-shell";
import { useDemo } from "@/components/app/demo-provider";
import { Button } from "@/components/ui/button";
import { gmailEmails } from "@/lib/demo-data";
import { formatTimestamp } from "@/lib/utils";

export default function SettingsPage() {
  const { state, applyEmailUpdates, connectGmail } = useDemo();
  const [connecting, setConnecting] = useState(false);

  async function handleConnect() {
    setConnecting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    connectGmail();
    setConnecting(false);
  }

  return (
    <PageShell>
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-white/35">Settings</div>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold">
          Mocked Gmail sync
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/56">
          Simulate OAuth, detect two relevant application emails, and push those signals into the
          tracker to complete the demo loop.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel rounded-[32px] p-6">
          <div className="flex items-center gap-3 text-white">
            <MailCheck className="size-5 text-cyan-200" />
            Gmail connection
          </div>
          <div className="mt-4 text-sm leading-7 text-white/58">
            Current status: {state.gmailConnected ? "Connected" : "Not connected"}
          </div>
          <Button className="mt-6" onClick={handleConnect}>
            {connecting ? "Connecting Gmail..." : state.gmailConnected ? "Reconnect Gmail" : "Connect Gmail"}
          </Button>
          {state.gmailConnected ? (
            <Button className="mt-3" onClick={applyEmailUpdates} variant="secondary">
              {state.emailUpdatesApplied ? "Tracker updated" : "Apply email updates to tracker"}
            </Button>
          ) : null}
        </div>

        <div className="glass-panel rounded-[32px] p-6">
          <div className="text-sm text-white/48">Detected emails</div>
          <div className="mt-4 space-y-4">
            {gmailEmails.map((email) => (
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5" key={email.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-medium text-white">{email.subject}</div>
                  <div className="text-xs text-white/38">{formatTimestamp(email.receivedAt)}</div>
                </div>
                <div className="mt-2 text-sm text-white/45">{email.from}</div>
                <div className="mt-3 text-sm leading-7 text-white/62">{email.preview}</div>
                <div className="mt-3 text-sm text-cyan-100">Suggested tracker status: {email.suggestedStatus}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
