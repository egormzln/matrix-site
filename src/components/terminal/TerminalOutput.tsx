"use client";

import type { OutputEntry } from "@/lib/commands/types";

const kindClass: Record<OutputEntry["kind"], string> = {
  input: "text-term-fg",
  output: "text-term-fg",
  error: "text-red-400",
};

export function TerminalOutput({ entries }: { entries: OutputEntry[] }) {
  return (
    <div className="flex flex-col gap-1">
      {entries.map((entry) => (
        <div key={entry.id} className={kindClass[entry.kind]}>
          {entry.kind === "input" ? (
            <span>
              <span className="text-term-dim">guest@egormzln:~$ </span>
              {entry.node}
            </span>
          ) : (
            entry.node
          )}
        </div>
      ))}
    </div>
  );
}
