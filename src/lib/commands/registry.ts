import { profile } from "@/lib/content/profile";
import { coreCommands } from "./core";
import { easterEggCommands } from "./easterEggs";
import type { Command, CommandContext } from "./types";

const allCommands: Command[] = [...coreCommands, ...easterEggCommands];

const byName = new Map<string, Command>();
for (const command of allCommands) {
  byName.set(command.name, command);
  for (const alias of command.aliases ?? []) {
    byName.set(alias, command);
  }
}

export function listCommands(): Command[] {
  return allCommands;
}

/** Parses and runs a command line against the registry. */
export function dispatch(line: string, ctx: CommandContext) {
  const tokens = line.trim().split(/\s+/);
  const name = tokens[0]?.toLowerCase();
  if (!name) return;

  const command = byName.get(name);
  if (!command) {
    ctx.print(`command not found: ${name}. Type \`help\`.`, "error");
    return;
  }
  command.run(tokens.slice(1), ctx);
}

/**
 * Autocomplete candidates for the current input. Completes command names,
 * and project ids for `open <prefix>`. Hidden commands are never suggested.
 */
export function complete(input: string): string[] {
  const trimmed = input.trimStart();
  const tokens = trimmed.split(/\s+/);

  if (tokens.length <= 1) {
    const prefix = (tokens[0] ?? "").toLowerCase();
    return allCommands
      .filter((command) => !command.hidden && command.name.startsWith(prefix))
      .map((command) => command.name);
  }

  if (tokens[0].toLowerCase() === "open") {
    const prefix = tokens[1].toLowerCase();
    return profile.projects
      .filter((project) => project.id.startsWith(prefix))
      .map((project) => `open ${project.id}`);
  }

  if (tokens[0].toLowerCase() === "theme") {
    const prefix = tokens[1].toLowerCase();
    return ["green", "amber"]
      .filter((theme) => theme.startsWith(prefix))
      .map((theme) => `theme ${theme}`);
  }

  return [];
}
