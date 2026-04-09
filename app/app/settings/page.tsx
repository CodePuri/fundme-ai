"use client";

import { useState } from "react";

import { PageShell } from "@/components/app/page-shell";
import { useDemo } from "@/components/app/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LogoImage } from "@/components/ui/logo-image";
import { Panel, PanelBody, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { StatusBadge, statusTone } from "@/components/ui/status-badge";
import { gmailEmails } from "@/lib/demo-data";
import { formatTimestamp } from "@/lib/utils";

function SocialCard({
  title,
  handle,
  domain,
  fallbackText,
  fallbackColor,
}: {
  title: string;
  handle: string;
  domain: string;
  fallbackText: string;
  fallbackColor: string;
}) {
  const [connected, setConnected] = useState(false);

  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LogoImage
            domain={domain}
            fallbackColor={fallbackColor}
            fallbackText={fallbackText}
            size={32}
          />
          <div>
            <div className="text-[15px] font-medium text-[var(--text-primary)]">{title}</div>
            {connected ? (
              <div className="mt-2 flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
                <span className="size-2 rounded-full bg-green-400" />
                <span>Connected</span>
                <span>{handle}</span>
              </div>
            ) : (
              <div className="mt-2 text-[13px] text-[var(--text-faint)]">Not connected</div>
            )}
          </div>
        </div>
        <Button onClick={() => setConnected((current) => !current)} variant="ghost">
          {connected ? "Disconnect" : `Connect ${title}`}
        </Button>
      </div>
    </div>
  );
}

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
        <div className="eyebrow">Settings</div>
        <h1 className="mt-3 text-[38px] font-semibold leading-none tracking-[-0.04em] text-[var(--text-primary)]">
          Settings
        </h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col gap-6">
          <Panel>
            <PanelHeader className="block">
              <PanelTitle>Profile Settings</PanelTitle>
            </PanelHeader>
            <PanelBody className="grid gap-5">
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input readOnly value="arjun@flowstate.ai" />
              </Field>

              <Field>
                <FieldLabel>Notification Preferences</FieldLabel>
                <label className="flex items-center gap-3 text-[14px] text-[var(--text-primary)]">
                  <input defaultChecked type="checkbox" />
                  Email me about new matches
                </label>
                <label className="mt-3 flex items-center gap-3 text-[14px] text-[var(--text-primary)]">
                  <input defaultChecked type="checkbox" />
                  Application deadline reminders
                </label>
              </Field>
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader className="block">
              <PanelTitle>Connected accounts</PanelTitle>
              <PanelDescription>Used to build your profile and auto-update your tracker.</PanelDescription>
            </PanelHeader>

            <PanelBody className="grid gap-4">
              <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <LogoImage
                      domain="gmail.com"
                      fallbackColor="#EA4335"
                      fallbackText="G"
                      size={32}
                    />
                    <div>
                      <div className="text-[15px] font-medium text-[var(--text-primary)]">Gmail</div>
                      <div className="mt-2 flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
                        <span className={`size-2 rounded-full ${state.gmailConnected ? "bg-green-400" : "bg-[var(--text-faint)]"}`} />
                        {state.gmailConnected ? "Connected" : "Not connected"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={handleConnect} variant="ghost">
                      {connecting
                        ? "Connecting..."
                        : state.gmailConnected
                          ? "Reconnect Gmail"
                          : "Connect Gmail"}
                    </Button>
                    {state.gmailConnected ? (
                      <Button onClick={applyEmailUpdates} variant="secondary">
                        {state.emailUpdatesApplied ? "Tracker updated" : "Apply updates"}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>

              <SocialCard
                domain="linkedin.com"
                fallbackColor="#0077B5"
                fallbackText="in"
                handle="linkedin.com/in/arjunmehta"
                title="LinkedIn"
              />
              <SocialCard
                domain="x.com"
                fallbackColor="#000000"
                fallbackText="X"
                handle="@arjunmehta"
                title="Twitter/X"
              />
            </PanelBody>
          </Panel>
        </div>

        <Panel>
          <PanelHeader>
            <PanelTitle>Detected Emails Actionable</PanelTitle>
            {state.emailUpdatesApplied ? <Badge tone="green">Tracker synced</Badge> : null}
          </PanelHeader>
          <PanelBody className="flex flex-col gap-4">
            {gmailEmails.map((email) => (
              <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-4" key={email.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[15px] font-medium text-[var(--text-primary)]">{email.subject}</div>
                  <div className="text-[12px] text-[var(--text-faint)]">{formatTimestamp(email.receivedAt)}</div>
                </div>
                <div className="mt-2 text-[13px] text-[var(--text-faint)]">{email.from}</div>
                <div className="mt-4 text-[14px] leading-7 text-[var(--text-muted)]">{email.preview}</div>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <StatusBadge className="text-[11px]" tone={statusTone(email.suggestedStatus)}>
                    {email.suggestedStatus}
                  </StatusBadge>
                  <Button onClick={applyEmailUpdates} variant="ghost">
                    Update {email.programSlug === "yc-w26" ? "YC" : "Antler"} to &quot;{email.suggestedStatus}&quot;
                  </Button>
                </div>
              </div>
            ))}
          </PanelBody>
        </Panel>
      </div>
    </PageShell>
  );
}
