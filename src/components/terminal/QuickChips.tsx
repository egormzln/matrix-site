"use client";

const CHIPS = [
  { label: "Projects", command: "projects" },
  { label: "About", command: "about" },
  { label: "Contact", command: "contact" },
];

/** Quick command buttons for touch devices — shown under the prompt. */
export function QuickChips({ onRun }: { onRun: (command: string) => void }) {
  return (
    <div className="flex gap-2 pt-2 sm:hidden">
      {CHIPS.map((chip) => (
        <button
          key={chip.command}
          type="button"
          onClick={() => onRun(chip.command)}
          className="rounded-full border border-term-dim px-3 py-1 text-sm text-term-fg active:bg-term-faint"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
