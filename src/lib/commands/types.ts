import type { ReactNode } from "react";
import type { Profile } from "@/lib/content/types";
import type { Theme } from "@/lib/store/useAppStore";

export type OutputKind = "input" | "output" | "error";

export interface OutputEntry {
  id: number;
  kind: OutputKind;
  node: ReactNode;
}

export interface CommandContext {
  profile: Profile;
  print: (node: ReactNode, kind?: OutputKind) => void;
  clear: () => void;
  setTheme: (theme: Theme) => void;
  openUrl: (url: string) => void;
  triggerGlitch: () => void;
  /** All registered commands (for `help`). */
  commands: () => Command[];
}

export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage?: string;
  /** Hidden commands are excluded from `help` and autocomplete. */
  hidden?: boolean;
  run: (args: string[], ctx: CommandContext) => void;
}
