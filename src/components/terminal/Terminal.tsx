'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { listCommands, dispatch as runCommand } from '@/lib/commands/registry';
import type {
  CommandContext,
  OutputEntry,
  OutputKind,
} from '@/lib/commands/types';
import { profile } from '@/lib/content/profile';
import { useKonami } from '@/lib/hooks/useKonami';
import { useAppStore } from '@/lib/store/useAppStore';
import { QuickChips } from './QuickChips';
import { TerminalInput } from './TerminalInput';
import { TerminalOutput } from './TerminalOutput';

interface TerminalState {
  entries: OutputEntry[];
  history: string[];
  nextId: number;
}

type TerminalAction =
  | { type: 'print'; kind: OutputKind; node: React.ReactNode }
  | { type: 'submit'; line: string }
  | { type: 'clear' };

function reducer(state: TerminalState, action: TerminalAction): TerminalState {
  switch (action.type) {
    case 'print':
      return {
        ...state,
        entries: [
          ...state.entries,
          { id: state.nextId, kind: action.kind, node: action.node },
        ],
        nextId: state.nextId + 1,
      };
    case 'submit':
      return {
        ...state,
        entries: [
          ...state.entries,
          { id: state.nextId, kind: 'input', node: action.line },
        ],
        history:
          action.line.trim().length > 0 && state.history.at(-1) !== action.line
            ? [...state.history, action.line]
            : state.history,
        nextId: state.nextId + 1,
      };
    case 'clear':
      return { ...state, entries: [] };
  }
}

function WelcomeBanner() {
  return (
    <div className="mb-2">
      <p className="mt-2 text-term-fg/60">
        Type <span className="text-term-bright">`help`</span> to see available
        commands.
      </p>
    </div>
  );
}

export function Terminal() {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    entries: [],
    history: [],
    nextId: 0,
  }));
  const scrollRef = useRef<HTMLDivElement>(null);
  const setTheme = useAppStore((s) => s.setTheme);
  const setGlitchActive = useAppStore((s) => s.setGlitchActive);

  const print = useCallback(
    (node: React.ReactNode, kind: OutputKind = 'output') => {
      dispatch({ type: 'print', kind, node });
    },
    [],
  );

  const triggerGlitch = useCallback(() => {
    setGlitchActive(true);
    window.setTimeout(() => setGlitchActive(false), 1000);
  }, [setGlitchActive]);

  const ctx = useMemo<CommandContext>(
    () => ({
      profile,
      print,
      clear: () => dispatch({ type: 'clear' }),
      setTheme: (theme) => {
        setTheme(theme);
        document.documentElement.dataset.theme = theme;
        try {
          localStorage.setItem('term-theme', theme);
        } catch {
          // private mode — non-fatal
        }
      },
      openUrl: (url) => window.open(url, '_blank', 'noopener,noreferrer'),
      triggerGlitch,
      commands: listCommands,
    }),
    [print, setTheme, triggerGlitch],
  );

  const submit = useCallback(
    (line: string) => {
      dispatch({ type: 'submit', line });
      if (line.trim().length > 0) runCommand(line, ctx);
    },
    [ctx],
  );

  useKonami(() => {
    triggerGlitch();
    print(
      <p className="text-term-bright">
        CHEAT MODE UNLOCKED. You already had all the access.
      </p>,
    );
  });

  // Keep the prompt visible: autoscroll on new output and when the mobile
  // virtual keyboard resizes the visual viewport.
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll must re-run on every new entry
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [state.entries]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const onResize = () => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    };
    viewport.addEventListener('resize', onResize);
    return () => viewport.removeEventListener('resize', onResize);
  }, []);

  return (
    <section
      aria-label="Interactive terminal"
      className="relative z-10 mx-auto flex h-[100dvh] w-full max-w-3xl flex-col px-4 pb-6 pt-14 sm:px-6 sm:pt-6"
    >
      <div
        ref={scrollRef}
        aria-live="polite"
        className="flex-1 overflow-y-auto pb-2 [scrollbar-width:thin] [scrollbar-color:var(--term-dim)_transparent]"
      >
        <WelcomeBanner />
        <TerminalOutput entries={state.entries} />
        <TerminalInput history={state.history} onSubmit={submit} />
      </div>
      <QuickChips onRun={submit} />
    </section>
  );
}
