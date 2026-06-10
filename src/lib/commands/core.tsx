import type { Command } from './types';

const PAD = 14;

export const coreCommands: Command[] = [
  {
    name: 'help',
    description: 'List available commands',
    run: (_args, ctx) => {
      const visible = ctx.commands().filter((command) => !command.hidden);
      ctx.print(
        <div>
          <p className="text-term-bright">Available commands:</p>
          {visible.map((command) => (
            <p key={command.name}>
              <span className="whitespace-pre text-term-bright">
                {command.name.padEnd(PAD)}
              </span>
              <span className="text-term-fg/80">{command.description}</span>
            </p>
          ))}
          <p className="mt-2 text-term-fg/60">
            Hints: ↑/↓ — history, Tab — autocomplete. Some commands are not
            listed.
          </p>
        </div>,
      );
    },
  },
  {
    name: 'whoami',
    description: 'Who is this?',
    run: (_args, ctx) => {
      ctx.print(
        <p>
          <span className="text-term-bright">{ctx.profile.name}</span> —{' '}
          {ctx.profile.role}
        </p>,
      );
    },
  },
  {
    name: 'about',
    aliases: ['cat'],
    description: 'cat about.txt',
    run: (_args, ctx) => {
      ctx.print(
        <div>
          <p className="text-term-fg/60"># about.txt</p>
          <p>{ctx.profile.about}</p>
        </div>,
      );
    },
  },
  {
    name: 'projects',
    aliases: ['ls'],
    description: 'ls projects',
    run: (_args, ctx) => {
      ctx.print(
        <div>
          {ctx.profile.projects.map((project) => (
            <p key={project.id}>
              <span className="whitespace-pre text-term-bright">
                {project.id.padEnd(18)}
              </span>
              <span className="text-term-fg/80">{project.description}</span>
              {project.flagship ? (
                <span className="text-term-bright"> ★</span>
              ) : null}
            </p>
          ))}
          <p className="mt-2 text-term-fg/60">
            Use `open &lt;project&gt;` for details.
          </p>
        </div>,
      );
    },
  },
  {
    name: 'open',
    description: 'Open a project',
    usage: 'open <project>',
    run: (args, ctx) => {
      const id = args[0];
      if (!id) {
        ctx.print(<p>usage: open &lt;project&gt;</p>, 'error');
        return;
      }
      const project = ctx.profile.projects.find(
        (candidate) => candidate.id === id,
      );
      if (!project) {
        ctx.print(<p>open: {id}: no such project. Try `projects`.</p>, 'error');
        return;
      }
      ctx.print(
        <div>
          <p className="text-term-bright">
            {project.name}
            {project.flagship ? ' ★ flagship' : ''}
          </p>
          <p className="text-term-fg/80">{project.description}</p>
          {project.url ? (
            <p>
              repo:{' '}
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {project.url}
              </a>
            </p>
          ) : (
            <p className="text-term-fg/60">No public repository (yet).</p>
          )}
        </div>,
      );
      if (project.url) ctx.openUrl(project.url);
    },
  },
  {
    name: 'experience',
    description: 'Work experience',
    run: (_args, ctx) => {
      ctx.print(
        <div>
          {ctx.profile.experience.map((entry) => (
            <div key={`${entry.company}-${entry.start}`} className="mb-1">
              <p className="text-term-bright">
                {entry.role} — {entry.company}
              </p>
              <p className="text-term-fg/80">
                {entry.employment} · {entry.start} — {entry.end ?? 'present'}
              </p>
            </div>
          ))}
        </div>,
      );
    },
  },
  {
    name: 'skills',
    description: 'Tech I work with',
    run: (_args, ctx) => {
      ctx.print(<p>{ctx.profile.skills.join(' · ')}</p>);
    },
  },
  {
    name: 'contact',
    description: 'Where to find me',
    run: (_args, ctx) => {
      ctx.print(
        <div>
          {ctx.profile.contacts.map((contact) => (
            <p key={contact.id}>
              <span className="whitespace-pre text-term-bright">
                {contact.label.padEnd(10)}
              </span>
              {contact.url ? (
                <a
                  href={contact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {contact.handle}
                </a>
              ) : (
                <span className="text-term-fg/60">{contact.handle}</span>
              )}
            </p>
          ))}
        </div>,
      );
    },
  },
  {
    name: 'cv',
    aliases: ['resume'],
    description: 'Download resume (PDF)',
    run: (_args, ctx) => {
      ctx.print(
        <p>
          <a
            href={ctx.profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            resume.pdf
          </a>{' '}
        </p>,
      );
      ctx.openUrl(ctx.profile.resumeUrl);
    },
  },
  {
    name: 'theme',
    description: 'Switch theme: green | amber',
    usage: 'theme <green|amber>',
    run: (args, ctx) => {
      const theme = args[0];
      if (theme !== 'green' && theme !== 'amber') {
        ctx.print(<p>usage: theme &lt;green|amber&gt;</p>, 'error');
        return;
      }
      ctx.setTheme(theme);
      ctx.print(<p>Theme set to {theme}.</p>);
    },
  },
  {
    name: 'clear',
    description: 'Clear the terminal',
    run: (_args, ctx) => {
      ctx.clear();
    },
  },
];
