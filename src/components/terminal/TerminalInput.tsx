"use client";

import { useRef, useState } from "react";
import { complete } from "@/lib/commands/registry";
import { audioEngine } from "@/lib/sound/audioEngine";

interface TerminalInputProps {
  history: string[];
  onSubmit: (line: string) => void;
}

/**
 * A visually hidden real <input> (mobile keyboard, IME and a11y for free)
 * mirrored into a styled line with a block caret at the cursor position.
 */
export function TerminalInput({ history, onSubmit }: TerminalInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [cursor, setCursor] = useState(0);
  // History navigation: index from the end; null = editing a fresh line.
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const draft = useRef("");
  // Tab completion cycling state; reset on any other interaction.
  const tabState = useRef<{ candidates: string[]; index: number } | null>(null);

  const syncCursor = () => {
    setCursor(inputRef.current?.selectionStart ?? 0);
  };

  const setLine = (line: string) => {
    setValue(line);
    setCursor(line.length);
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(line.length, line.length);
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    audioEngine.click();

    if (event.key === "Enter") {
      event.preventDefault();
      tabState.current = null;
      setHistoryIndex(null);
      draft.current = "";
      onSubmit(value);
      setLine("");
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      tabState.current = null;
      if (history.length === 0) return;
      const next =
        historyIndex === null
          ? history.length - 1
          : Math.max(historyIndex - 1, 0);
      if (historyIndex === null) draft.current = value;
      setHistoryIndex(next);
      setLine(history[next]);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      tabState.current = null;
      if (historyIndex === null) return;
      if (historyIndex >= history.length - 1) {
        setHistoryIndex(null);
        setLine(draft.current);
      } else {
        const next = historyIndex + 1;
        setHistoryIndex(next);
        setLine(history[next]);
      }
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      if (tabState.current) {
        // Cycle through matches on repeated Tab.
        const state = tabState.current;
        state.index = (state.index + 1) % state.candidates.length;
        setLine(state.candidates[state.index]);
        return;
      }
      const candidates = complete(value);
      if (candidates.length === 0) return;
      tabState.current = { candidates, index: 0 };
      setLine(candidates[0]);
      return;
    }

    tabState.current = null;
  };

  return (
    <div className="relative">
      <label className="flex flex-wrap items-center whitespace-pre-wrap break-all">
        <span className="sr-only">Terminal command input</span>
        <span aria-hidden="true" className="text-term-dim">
          guest@egormzln:~${" "}
        </span>
        <span aria-hidden="true">{value.slice(0, cursor)}</span>
        <span aria-hidden="true" className="term-caret" />
        <span aria-hidden="true">{value.slice(cursor)}</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setHistoryIndex(null);
            requestAnimationFrame(syncCursor);
          }}
          onKeyDown={onKeyDown}
          onSelect={syncCursor}
          // biome-ignore lint/a11y/noAutofocus: the terminal prompt is the page's primary interface
          autoFocus
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
          aria-label="Terminal command input"
          className="absolute inset-0 h-full w-full cursor-text opacity-0"
        />
      </label>
    </div>
  );
}
