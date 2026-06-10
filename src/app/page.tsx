import { ExperienceLoader } from "@/components/experience/ExperienceLoader";
import { profile } from "@/lib/content/profile";
import { buildPersonJsonLd } from "@/lib/seo/jsonLd";

/**
 * Server component. Renders the full portfolio as semantic HTML so crawlers,
 * no-JS visitors and reader modes get real content. Once the client experience
 * mounts, this block is visually hidden via [data-app-ready] CSS but stays in
 * the DOM. The canvas/terminal is a progressive enhancement on top.
 */
export default function Home() {
  const jsonLd = buildPersonJsonLd(profile);

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: serialized from static typed content
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main
        id="static-content"
        className="mx-auto w-full max-w-2xl px-6 py-16 font-mono"
      >
        <header>
          <h1 className="text-3xl font-bold text-term-bright">
            {profile.name}
          </h1>
          <p className="mt-1 text-lg">{profile.role}</p>
          <p className="mt-4 text-term-fg/80">{profile.about}</p>
        </header>

        <section aria-labelledby="projects-heading" className="mt-12">
          <h2
            id="projects-heading"
            className="text-xl font-bold text-term-bright"
          >
            Projects
          </h2>
          <ul className="mt-4 flex flex-col gap-4">
            {profile.projects.map((project) => (
              <li key={project.id}>
                <h3 className="font-bold">
                  {project.url ? (
                    <a href={project.url} className="underline">
                      {project.name}
                    </a>
                  ) : (
                    project.name
                  )}
                  {project.flagship ? " ★" : null}
                </h3>
                <p className="text-term-fg/80">{project.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="experience-heading" className="mt-12">
          <h2
            id="experience-heading"
            className="text-xl font-bold text-term-bright"
          >
            Experience
          </h2>
          <ul className="mt-4 flex flex-col gap-4">
            {profile.experience.map((entry) => (
              <li key={`${entry.company}-${entry.start}`}>
                <h3 className="font-bold">
                  {entry.role} — {entry.company}
                </h3>
                <p className="text-term-fg/80">
                  {entry.employment} · {entry.start} — {entry.end ?? "present"}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="skills-heading" className="mt-12">
          <h2
            id="skills-heading"
            className="text-xl font-bold text-term-bright"
          >
            Skills
          </h2>
          <p className="mt-4 text-term-fg/80">{profile.skills.join(" · ")}</p>
        </section>

        <section aria-labelledby="contact-heading" className="mt-12">
          <h2
            id="contact-heading"
            className="text-xl font-bold text-term-bright"
          >
            Contact
          </h2>
          <ul className="mt-4 flex flex-col gap-2">
            {profile.contacts.map((contact) => (
              <li key={contact.id}>
                {contact.label}:{" "}
                {contact.url ? (
                  <a href={contact.url} className="underline">
                    {contact.handle}
                  </a>
                ) : (
                  <span className="text-term-fg/60">{contact.handle}</span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-4">
            <a href={profile.resumeUrl} className="underline">
              Resume (PDF)
            </a>
          </p>
        </section>
      </main>
      <ExperienceLoader />
    </>
  );
}
