"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Globe, UploadCloud } from "lucide-react";

import { PageShell } from "@/components/app/page-shell";
import { useDemo } from "@/components/app/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const processingStages = [
  "Reading uploaded materials",
  "Extracting startup context",
  "Building founder profile",
  "Matching funding opportunities",
];

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { state, setUploadInputs } = useDemo();
  const [sourceUrl, setSourceUrl] = useState(state.uploadSourceUrl);
  const [notes, setNotes] = useState(state.founderNotes);
  const [files, setFiles] = useState(state.selectedFiles);
  const [processing, setProcessing] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  async function handleSubmit() {
    setProcessing(true);
    setUploadInputs({ sourceUrl, notes, files });

    for (let index = 0; index < processingStages.length; index += 1) {
      setStageIndex(index);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    router.push("/app/startup-profile");
  }

  return (
    <PageShell>
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/35">Upload</div>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold">
            Drop in your messy startup material
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/56">
            Decks, founder notes, old application answers, website URLs, and memos all compress
            into one structured profile and application plan.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="glass-panel rounded-[32px] p-6">
          <button
            className="flex min-h-[280px] w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-cyan-300/22 bg-cyan-300/[0.03] px-6 text-center transition hover:-translate-y-1 hover:bg-cyan-300/[0.05]"
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <UploadCloud className="size-9 text-cyan-200" />
            <div className="mt-5 text-xl font-semibold">Upload pitch deck, memo, or previous answers</div>
            <div className="mt-2 max-w-md text-sm leading-7 text-white/55">
              This demo visually accepts any file. We use believable hardcoded extraction output to
              tell a flawless founder story.
            </div>
            <div className="mt-6 text-sm text-cyan-100">Click to add files</div>
          </button>

          <input
            className="hidden"
            multiple
            onChange={(event) => {
              const nextFiles = Array.from(event.target.files ?? []).map((file) => file.name);
              if (nextFiles.length > 0) {
                setFiles(nextFiles);
              }
            }}
            ref={inputRef}
            type="file"
          />

          <div className="mt-6 flex flex-wrap gap-3">
            {files.map((file) => (
              <Badge key={file}>{file}</Badge>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-[32px] p-6">
            <div className="flex items-center gap-2 text-sm text-white/52">
              <Globe className="size-4" />
              Website or LinkedIn
            </div>
            <Input
              className="mt-4"
              onChange={(event) => setSourceUrl(event.target.value)}
              placeholder="https://flowstate.ai or linkedin.com/in/arjunmehta"
              value={sourceUrl}
            />
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <div className="text-sm text-white/52">Founder notes</div>
            <Textarea
              className="mt-4"
              onChange={(event) => setNotes(event.target.value)}
              value={notes}
            />
          </div>

          <Button className="w-full justify-center" onClick={handleSubmit}>
            Generate startup profile
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {processing ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070bcc]/90 px-6 backdrop-blur-lg"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <motion.div
              animate={{ scale: 1, opacity: 1 }}
              className="glass-panel w-full max-w-2xl rounded-[36px] p-8"
              initial={{ scale: 0.98, opacity: 0 }}
            >
              <div className="text-xs uppercase tracking-[0.24em] text-white/35">AI processing</div>
              <div className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold">
                Turning founder inputs into a clean application workflow
              </div>

              <div className="mt-8 space-y-4">
                {processingStages.map((stage, index) => {
                  const active = stageIndex === index;
                  const complete = stageIndex > index;

                  return (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
                      initial={{ opacity: 0, y: 10 }}
                      key={stage}
                      transition={{ delay: index * 0.08 }}
                    >
                      <div className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/6">
                        {complete ? (
                          <CheckCircle2 className="size-4 text-emerald-300" />
                        ) : (
                          <div
                            className={`size-2 rounded-full ${
                              active ? "bg-cyan-200 shadow-[0_0_18px_rgba(125,211,252,0.8)]" : "bg-white/20"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white">{stage}</div>
                        <div className="mt-1 text-xs text-white/42">
                          {complete
                            ? "Completed"
                            : active
                              ? "In progress"
                              : "Queued"}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageShell>
  );
}
